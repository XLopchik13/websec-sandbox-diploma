from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24 * 7

    resend_api_key: str = ""
    email_from: str = "onboarding@resend.dev"
    app_url: str = "http://localhost:5173"


settings = Settings()  # type: ignore
