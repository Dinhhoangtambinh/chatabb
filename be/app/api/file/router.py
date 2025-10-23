from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.core.logging_config import logger
from app.api.file.schemas import FileRead
from app.api.file.controller import (
    upload_to_supabase, 
    create_file_record, 
    get_files_by_conversation, 
    parse_csv_metadata
)

router = APIRouter()

@router.post("/", response_model=FileRead)
async def upload_file(
    file: UploadFile,
    filetype: str,
    conversation_id: UUID,
    message_id: UUID | None = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    try:
        fileurl, size = upload_to_supabase(file, filetype)
        if filetype == "csv":
            csv_info = parse_csv_metadata(file)
            logger.info(f"CSV summary: {csv_info}")

        db_file = create_file_record(
            db=db,
            user_id=current_user.id,  # type: ignore
            conversation_id=conversation_id,
            message_id=message_id,
            filename=file.filename,
            filetype=filetype,
            fileurl=fileurl,
            size=size
        )

        logger.info(f"File uploaded to Supabase: {db_file.filename} ({size} bytes)")
        return db_file

    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Upload failed: {repr(e)}")
        raise HTTPException(status_code=500, detail="Internal server error during file upload")


@router.get("/conversation/{conversation_id}", response_model=list[FileRead])
def list_files(conversation_id: UUID, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    files = get_files_by_conversation(db, conversation_id)
    return files
