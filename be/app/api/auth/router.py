from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import create_access_token
from app.core.logging_config import logger
from app.core.dependencies import get_current_user

from ..user.schemas import Token, UserCreate, UserRead
from ..user.controller import (
    create_user,
    authenticate_user,
    get_user_by_username,
)

router = APIRouter()

@router.post("/register", response_model=UserRead)
def register_user(user_in: UserCreate, db: Session = Depends(get_db)):
    existing_user = get_user_by_username(db, user_in.username)
    if existing_user:
        logger.warning(f"Registration attempt with existing username: {user_in.username}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered",
        )
    
    try:
        user = create_user(db, user_in.username, user_in.password)
        logger.info(f"User registered successfully: {user.username}")
        return user
    except Exception as e:
        logger.error(f"Error registering user {user_in.username}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error",
        )

@router.post("/login", response_model=Token)
def login_user(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        logger.warning(f"Failed login attempt for username: {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(data={"sub": user.username})

    logger.info(f"User logged in successfully: {user.username}")
    return Token(access_token=access_token)

@router.get("/me", response_model=UserRead)
def read_current_user(token: str = Depends(OAuth2PasswordBearer(tokenUrl="auth/login")), db: Session = Depends(get_db)):
    current_user = get_current_user(token=token, db=db)
    logger.info(f"Current user retrieved: {current_user.username}")
    return current_user