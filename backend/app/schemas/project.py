from datetime import date, datetime

from pydantic import BaseModel, ConfigDict


class ProjectImageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    s3_key: str
    display_order: int


class ProjectOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str
    stack: list[str]
    status: str
    display_order: int
    start_date: date | None
    end_date: date | None
    created_at: datetime
    updated_at: datetime
    images: list[ProjectImageOut]


class ProjectCreate(BaseModel):
    title: str
    description: str
    stack: list[str]
    status: str
    display_order: int = 0
    start_date: date | None = None
    end_date: date | None = None


class ProjectUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    stack: list[str] | None = None
    status: str | None = None
    display_order: int | None = None
    start_date: date | None = None
    end_date: date | None = None
