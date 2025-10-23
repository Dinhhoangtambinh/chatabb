from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

class MessageBase(BaseModel):
    content: str

class MessageCreate(MessageBase):
    conversation_id: UUID

class MessageRead(MessageBase):
    id: UUID
    content: str
    sender: str
    user_id: UUID
    conversation_id: UUID
    created_at: datetime
    updated_at: datetime | None = None

    model_config = {
        "from_attributes": True
    }

class MessageResponse(BaseModel):
    id: UUID
    content: str
    sender: str
    conversation_id: UUID
    user_id: UUID
    created_at: datetime

    model_config = {
        "from_attributes": True
    }