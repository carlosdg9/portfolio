from fastapi import APIRouter, HTTPException, Request
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.param_functions import Depends
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.core.config import settings
from app.core.security import create_access_token, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])

limiter = Limiter(key_func=get_remote_address)


@router.post("/login")
@limiter.limit("5/minute")
def login(request: Request, form_data: OAuth2PasswordRequestForm = Depends()) -> dict[str, str]:
    valid_username = form_data.username == settings.admin_username
    valid_password = valid_username and verify_password(form_data.password, settings.admin_password_hash)

    if not valid_username or not valid_password:
        raise HTTPException(status_code=401, detail="Usuario o contrasena incorrectos")

    token = create_access_token(subject=form_data.username)
    return {"access_token": token, "token_type": "bearer"}
