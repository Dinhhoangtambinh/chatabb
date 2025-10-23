import os
import uuid
import io
import pandas as pd
from fastapi import UploadFile, HTTPException, status
from sqlalchemy.orm import Session
from supabase import create_client, Client

from app.api.file.model import File

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SUPABASE_BUCKET_IMAGES = os.getenv("SUPABASE_BUCKET_IMAGES", "images")
SUPABASE_BUCKET_CSV = os.getenv("SUPABASE_BUCKET_CSV", "csv")
MAX_FILE_SIZE = 10 * 1024 * 1024  

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Supabase URL and KEY must be set in environment variables.")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def get_bucket_by_type(filetype: str) -> str:
    if filetype == "image":
        return SUPABASE_BUCKET_IMAGES
    elif filetype == "csv":
        return SUPABASE_BUCKET_CSV
    else:
        raise HTTPException(status_code=400, detail="filetype must be 'image' or 'csv'")
    
def upload_to_supabase(file: UploadFile, filetype: str) -> tuple[str, int]:
    content = file.file.read()
    size = len(content)

    if size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File is too large ({size/1024/1024:.2f}MB). Maximum limit is {MAX_FILE_SIZE/1024/1024:.0f}MB."
        )

    ext = os.path.splitext(file.filename)[1]  # type: ignore

    if ext not in [".png", ".jpg", ".jpeg", ".csv"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file extension: {ext}. Allowed extensions are .png, .jpg, .jpeg, .csv"
        )

    filename = f"{uuid.uuid4()}{ext}"
    bucket_name = get_bucket_by_type(filetype)
    path = f"{bucket_name}/{filename}"

    # Upload file lên Supabase
    supabase.storage.from_(bucket_name).upload(filename, content)

    # Lấy public URL
    public_url = supabase.storage.from_(bucket_name).get_public_url(filename)

    return public_url, size


def parse_csv_metadata(file: UploadFile) -> dict:
    content = file.file.read()
    file.file.seek(0)
    df = pd.read_csv(io.BytesIO(content))
    return {
        "rows": len(df),
        "columns": len(df.columns),
        "column_names": df.columns.tolist()
    }


def create_file_record(db: Session, *, user_id, conversation_id, message_id, filename, filetype, fileurl, size):
    db_file = File(
        filename=filename,
        filetype=filetype,
        fileurl=fileurl,
        size=size,
        user_id=user_id,
        conversation_id=conversation_id,
        message_id=message_id,
    )
    db.add(db_file)
    db.commit()
    db.refresh(db_file)
    return db_file


def get_files_by_conversation(db: Session, conversation_id):
    return db.query(File).filter(File.conversation_id == conversation_id).order_by(File.uploaded_at.desc()).all()