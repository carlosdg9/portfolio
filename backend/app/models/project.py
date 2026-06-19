from datetime import date, datetime

from sqlalchemy import Date, DateTime, ForeignKey, Integer, JSON, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class ProjectStatus:
    EN_DESARROLLO = "en_desarrollo"
    COMPLETADO = "completado"
    PAUSADO = "pausado"


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(120), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    stack: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default=ProjectStatus.EN_DESARROLLO)
    display_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    start_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    end_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    images: Mapped[list["ProjectImage"]] = relationship(
        back_populates="project", cascade="all, delete-orphan", order_by="ProjectImage.display_order"
    )


class ProjectImage(Base):
    __tablename__ = "project_images"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"), nullable=False)
    s3_key: Mapped[str] = mapped_column(String(255), nullable=False)
    display_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    project: Mapped["Project"] = relationship(back_populates="images")
