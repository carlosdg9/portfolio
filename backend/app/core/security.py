from datetime import datetime, timedelta, timezone

import bcrypt
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt

from app.core.config import settings

ALGORITHM = "HS256"

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def verify_password(plain_password: str, password_hash: str) -> bool:
    return bcrypt.checkpw(plain_password.encode(), password_hash.encode())


def create_access_token(subject: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes)
    payload = {"sub": subject, "exp": expire}
    return jwt.encode(payload, settings.secret_key, algorithm=ALGORITHM)


def get_current_admin(token: str = Depends(oauth2_scheme)) -> str:
    credentials_error = HTTPException(status_code=401, detail="Credenciales invalidas")
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[ALGORITHM])
        username = payload.get("sub")
    except JWTError:
        raise credentials_error

    if username != settings.admin_username:
        raise credentials_error

    return username
