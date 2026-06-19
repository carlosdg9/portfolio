from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import get_current_admin
from app.db.session import get_db
from app.models.project import Project
from app.schemas.project import ProjectCreate, ProjectOut, ProjectUpdate

router = APIRouter(prefix="/projects", tags=["projects"])


@router.get("", response_model=list[ProjectOut])
def list_projects(db: Session = Depends(get_db)) -> list[Project]:
    stmt = select(Project).order_by(Project.display_order)
    return list(db.scalars(stmt))


@router.get("/{project_id}", response_model=ProjectOut)
def get_project(project_id: int, db: Session = Depends(get_db)) -> Project:
    project = db.get(Project, project_id)
    if project is None:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    return project


@router.post("", response_model=ProjectOut, status_code=201)
def create_project(
    data: ProjectCreate,
    db: Session = Depends(get_db),
    _admin: str = Depends(get_current_admin),
) -> Project:
    project = Project(**data.model_dump())
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


@router.put("/{project_id}", response_model=ProjectOut)
def update_project(
    project_id: int,
    data: ProjectUpdate,
    db: Session = Depends(get_db),
    _admin: str = Depends(get_current_admin),
) -> Project:
    project = db.get(Project, project_id)
    if project is None:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(project, field, value)

    db.commit()
    db.refresh(project)
    return project


@router.delete("/{project_id}", status_code=204)
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    _admin: str = Depends(get_current_admin),
) -> None:
    project = db.get(Project, project_id)
    if project is None:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")

    db.delete(project)
    db.commit()
