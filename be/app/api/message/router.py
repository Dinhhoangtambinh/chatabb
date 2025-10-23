from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.core.database import get_db
from app.core.logging_config import logger
from app.core.dependencies import get_current_user

from .schemas import MessageCreate, MessageRead
from .controller import (
    get_messages_by_conversation,
    get_message_by_id,
    create_message,
    delete_message
)
from .model import Message
from app.api.user.model import User
from app.api.conversation.controller import get_conversation_by_id

router = APIRouter()

@router.get("/conversation/{conversation_id}", response_model=List[MessageRead])
def list_messages(
    conversation_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    conversation = get_conversation_by_id(db, conversation_id)
    if not conversation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")
    if conversation.user_id != current_user.id: #type: ignore
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    messages = get_messages_by_conversation(db, conversation_id)
    logger.info(f"User {current_user.username} fetched {len(messages)} messages from conversation_id={conversation_id}")
    return messages


@router.post("/", response_model=MessageRead)
def create_new_message(
    message_in: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    conversation = get_conversation_by_id(db, message_in.conversation_id)
    if not conversation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")
    if conversation.user_id != current_user.id: #type: ignore
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    try:
        message = create_message(
            db,
            user_id=current_user.id,
            conversation_id=message_in.conversation_id,
            content=message_in.content,
            sender="user"
        )
        logger.info(f"Message created by user={current_user.username} in conversation_id={message_in.conversation_id}")
        return message
    except Exception as e:
        logger.error(f"Error creating message: {repr(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create message")


# === Delete a message ===
@router.delete("/{message_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_message(
    message_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    message = get_message_by_id(db, message_id)
    if not message:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message not found")
    if message.user_id != current_user.id: #type: ignore
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    delete_message(db, message_id)
    logger.info(f"Message id={message_id} deleted by user={current_user.username}")
    return None
