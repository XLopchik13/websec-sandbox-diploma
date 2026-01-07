import secrets

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str
    jwt_secret: str = secrets.token_urlsafe(32)
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 30


settings = Settings()  # type: ignore
