from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

class FileBase(BaseModel):
    filename: str
    filetype: str
    fileurl: str
    size: int

class FileCreate(BaseModel):
    filetype: str
    conversation_id: UUID
    message_id: UUID | None = None

class FileRead(FileBase):
    id: UUID
    user_id: UUID
    conversation_id: UUID
    message_id: UUID | None = None
    uploaded_at: datetime

    model_config = {
        "from_attributes": True
    }