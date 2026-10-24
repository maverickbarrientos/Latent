from pydantic import BaseModel, Field


class TestResult(BaseModel):
    timestamp: str
    network: str
    download: float = Field(ge=0)
    upload: float = Field(ge=0)
    ping: float = Field(ge=0)
    jitter: float = Field(default=0, ge=0)
    loss: float = Field(default=0, ge=0, le=100)


class Settings(BaseModel):
    min_download: float = 0
    min_upload: float = 0
    max_ping: float = 0
