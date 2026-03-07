from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    gemini_api_key: str = ""
    redis_url: str = "redis://localhost:6379"
    database_url: str = ""
    cors_origins: list[str] = ["http://localhost:5173"]
    use_mock: bool = False

    class Config:
        env_file = ".env"


settings = Settings()
