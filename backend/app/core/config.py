from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

ENV_FILE = Path(__file__).resolve().parents[3] / ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=ENV_FILE, extra="ignore")

    database_url: str
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24 * 7

    resend_api_key: str = ""
    email_from: str = "onboarding@resend.dev"
    app_url: str = "http://localhost:5173"

    @property
    def email_verification_enabled(self) -> bool:
        return bool(self.resend_api_key)


settings = Settings()  # type: ignore
