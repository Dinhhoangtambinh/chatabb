from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

class ConversationBase(BaseModel):
    title: str

class ConversationCreate(ConversationBase):
    pass

class ConversationUpdate(ConversationBase):
    title: str | None = None

class ConversationRead(ConversationBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime | None = None

    model_config = {
        "from_attributes": True
    }