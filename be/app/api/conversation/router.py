from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Request
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.core.logging_config import logger
from app.core.dependencies import get_current_user

from .schemas import ConversationCreate, ConversationRead, ConversationUpdate
from .controller import (
    get_conversation_by_id,
    get_conversations_by_user,
    create_conversation,
    update_conversation,
    delete_conversation,
    add_message_to_conversation
)
from .model import Conversation
from app.api.user.model import User 
from app.api.message.schemas import MessageResponse

router = APIRouter()

# Get all conversations for current user
@router.get("/", response_model=List[ConversationRead])
def list_conversations(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    conversations = get_conversations_by_user(db, current_user.id)
    logger.info(f"User {current_user.username} fetched {len(conversations)} conversations")
    return conversations

# Get conversation by ID
@router.get("/{conversation_id}", response_model=ConversationRead)
def get_conversation(conversation_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    conversation = get_conversation_by_id(db, conversation_id)
    if not conversation:
        logger.warning(f"Conversation not found: id={conversation_id}")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")

    if conversation.user_id != current_user.id: #type: ignore
        logger.warning(f"Unauthorized access: user_id={current_user.id} tried to access conversation_id={conversation_id}")
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    return conversation

# Create new conversation
@router.post("/", response_model=ConversationRead)
def create_new_conversation(
    conversation_in: ConversationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        conversation = create_conversation(db, conversation_in.title, current_user.id)
        return conversation
    except Exception as e:
        logger.error(f"Error creating conversation for user_id={current_user.id}: {repr(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create conversation")

# Update conversation title
@router.put("/{conversation_id}", response_model=ConversationRead)
def update_conversation_title(
    conversation_id: str,
    conversation_in: ConversationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    conversation = get_conversation_by_id(db, conversation_id)
    if not conversation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")
    if conversation.user_id != current_user.id: #type: ignore
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    updated = update_conversation(db, conversation_id, conversation_in.title) #type: ignore
    return updated

# Delete conversation
@router.delete("/{conversation_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_conversation(
    conversation_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    conversation = get_conversation_by_id(db, conversation_id)
    if not conversation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")
    if conversation.user_id != current_user.id: #type: ignore
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    delete_conversation(db, conversation_id)
    return None




@router.post("/{conversation_id}/messages/", response_model=dict)
async def send_message_in_conversation(
    conversation_id: str,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    content: Optional[str] = request.query_params.get("content")
    files: Optional[List[UploadFile]] = None

    ctype = request.headers.get("content-type", "")
    if ctype.startswith("multipart/"):
        form = await request.form()
        raw_files = []
        try:
            raw_files = list(form.getlist("files"))  # type: ignore
        except Exception:
            val = form.get("files")
            raw_files = [val] if val is not None else []

        filtered = [f for f in raw_files if hasattr(f, "filename")]
        files = filtered if filtered else None  # type: ignore

        form_content = form.get("content")
        if form_content is not None:
            content = str(form_content)

    result = await add_message_to_conversation(
        db=db,
        user_id=current_user.id, #type: ignore
        conversation_id=conversation_id,
        content=content,
        files=files
    )
    
    message = result["message"]
    ai_message = result["ai_message"]

    message_data = MessageResponse.model_validate(message) if message else None
    ai_message_data = MessageResponse.model_validate(ai_message) if ai_message else None

    return {
        "message": message_data,
        "ai_message": ai_message_data
    }
