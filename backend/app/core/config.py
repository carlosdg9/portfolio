from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    database_url: str
    secret_key: str
    access_token_expire_minutes: int = 60

    aws_access_key_id: str = ""
    aws_secret_access_key: str = ""
    aws_region: str = ""
    aws_s3_bucket: str = ""

    cors_origins: str = "http://localhost:5173"

    admin_username: str
    admin_password_hash: str


settings = Settings()
