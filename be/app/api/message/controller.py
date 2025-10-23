from sqlalchemy.orm import Session
from .model import Message
from app.core.logging_config import logger

def get_messages_by_conversation(db: Session, conversation_id):
    return (
        db.query(Message)
        .filter(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.asc())
        .all()
    )

def get_message_by_id(db: Session, message_id):
    return db.query(Message).filter(Message.id == message_id).first()

def create_message(db: Session, user_id, conversation_id, content, sender: str = "user"):
    message = Message(
        user_id=user_id,
        conversation_id=conversation_id,
        content=content,
        sender=sender,
    )
    db.add(message)
    db.commit()
    db.refresh(message)
    logger.info(f"New message created by user_id={user_id} in conversation_id={conversation_id}")
    return message

def delete_message(db: Session, message_id):
    message = get_message_by_id(db, message_id)
    if not message:
        return None
    db.delete(message)
    db.commit()
    logger.info(f"Deleted message id={message_id}")
    return True
