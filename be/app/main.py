from fastapi import FastAPI

from app.core.middleware import ErrorLoggingMiddleware
from app.core.logging_config import logger

from app.api.auth.router import router as auth_router
from app.api.user.router import router as user_router
from app.api.conversation.router import router as conversation_router
from app.api.file.router import router as file_router
from app.api.message.router import router as message_router

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="AppChat Backend API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(ErrorLoggingMiddleware)

app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(user_router, prefix="/users", tags=["users"])
app.include_router(conversation_router, prefix="/conversations", tags=["conversations"])
app.include_router(file_router, prefix="/files", tags=["files"])
app.include_router(message_router, prefix="/messages", tags=["messages"])

@app.get("/health")
def health_check():
    logger.info("Health check OK")
    return {"status": "ok"}