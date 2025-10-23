from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.logging_config import logger
from app.core.dependencies import get_current_user

from .schemas import UserCreate, UserRead
from .controller import (
    get_user_by_username,
    create_user,
)
from .model import User

router = APIRouter()

# Get by username
@router.get("/{username}", response_model=UserRead)
def get_user(username: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    user = get_user_by_username(db, username)
    if current_user.id != user.id: #type: ignore
        logger.warning(f"Unauthorized access attempt by user id={current_user.id} to user {username}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this user's details"
        )
    if not user:
        logger.warning(f"User not found: {username}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    logger.info(f"Fetched user details: {username}")
    return user

# Create new user - test
@router.post("/", response_model=UserRead)
def create_new_user(user_in: UserCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    existing_user = get_user_by_username(db, user_in.username)
    if existing_user:
        logger.warning(f"Attempt to create existing user: {user_in.username}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists"
        )

    try:
        user = create_user(db, user_in.username, user_in.password)
        logger.info(f"Created new user: {user.username} (id={user.id})")
        return user
    except Exception as e:
        logger.error(f"Error creating user {user_in.username}: {repr(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user"
        )