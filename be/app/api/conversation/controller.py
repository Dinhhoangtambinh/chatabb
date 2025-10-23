from sqlalchemy.orm import Session
from fastapi import UploadFile, HTTPException, status
from typing import Optional, List

from .model import Conversation
from app.core.logging_config import logger

from app.api.message.controller import create_message
from app.api.file.controller import (
    upload_to_supabase,
    create_file_record,
    MAX_FILE_SIZE
)

from app.services.chat_service import process_chat_message


def get_conversation_by_id(db: Session, conversation_id):
    return db.query(Conversation).filter(Conversation.id == conversation_id).first()

def get_conversations_by_user(db: Session, user_id):
    return db.query(Conversation).filter(Conversation.user_id == user_id).order_by(Conversation.created_at.desc()).all()


def create_conversation(db: Session, title: str, user_id):
    conversation = Conversation(title=title, user_id=user_id)
    db.add(conversation)
    db.commit()
    db.refresh(conversation)
    logger.info(f"Created new conversation: {conversation.title} for user_id={user_id}")
    return conversation


def update_conversation(db: Session, conversation_id, title: str):
    conversation = get_conversation_by_id(db, conversation_id)
    if not conversation:
        return None
    conversation.title = title #type: ignore
    db.commit()
    db.refresh(conversation)
    logger.info(f"Updated conversation id={conversation_id} title={title}")
    return conversation


def delete_conversation(db: Session, conversation_id):
    conversation = get_conversation_by_id(db, conversation_id)
    if not conversation:
        return None
    db.delete(conversation)
    db.commit()
    logger.info(f"Deleted conversation id={conversation_id}")
    return True



async def add_message_to_conversation(
    db: Session,
    user_id: str,
    conversation_id: str,
    content: Optional[str] = None,
    files: Optional[List[UploadFile]] = None,
):
    conversation = get_conversation_by_id(db, conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    message = None
    if content:
        message = create_message(
            db=db,
            user_id=user_id,
            conversation_id=conversation_id,
            content=content,
            sender="user"
        )

    uploaded_files = []
    if files:
        for file in files:
            file.file.seek(0)

            file_bytes = await file.read()
            file.file.seek(0)

            if not file_bytes:
                raise HTTPException(status_code=400, detail=f"File {file.filename} is empty")

            size = len(file_bytes)

            if size > MAX_FILE_SIZE:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"File {file.filename} is too large ({size/1024/1024:.2f}MB). Maximum limit is {MAX_FILE_SIZE/1024/1024:.0f}MB."
                )
            ext = file.filename.split('.')[-1].lower() #type: ignore
            filetype = "image" if ext in ["png", "jpg", "jpeg", "gif"] else "csv"

            fileurl, size = upload_to_supabase(file, filetype)

            create_file_record(
                db=db,
                user_id=user_id,
                conversation_id=conversation_id,
                message_id=message.id if message else None,
                filename=file.filename, #type: ignore
                filetype=filetype,
                fileurl=fileurl,
                size=size
            )

            uploaded_files.append({
                "bytes": file_bytes,
                "type": filetype,
                "mime": file.content_type,
                "filename": file.filename
            })

    ai_response = await process_chat_message(
        content=content if content else "",
        files=uploaded_files
    )

    ai_message = create_message(
        db=db,
        user_id=user_id,
        conversation_id=conversation_id,
        content=ai_response,
        sender="system"
    )

    logger.info(f"Added message and AI replys to conversation id={conversation_id}")
    return {
        "message": message,
        "ai_message": ai_message
    }