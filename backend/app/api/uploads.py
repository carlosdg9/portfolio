import uuid

from fastapi import APIRouter, Depends, HTTPException, UploadFile
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.s3 import get_s3_client
from app.core.security import get_current_admin
from app.db.session import get_db
from app.models.project import Project, ProjectImage
from app.schemas.project import ProjectImageOut

router = APIRouter(prefix="/projects", tags=["projects"])

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024


@router.post("/{project_id}/images", response_model=ProjectImageOut, status_code=201)
def upload_project_image(
    project_id: int,
    file: UploadFile,
    db: Session = Depends(get_db),
    _admin: str = Depends(get_current_admin),
) -> ProjectImage:
    project = db.get(Project, project_id)
    if project is None:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")

    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(status_code=400, detail="Formato de imagen no permitido")

    content = file.file.read()
    if len(content) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(status_code=400, detail="La imagen supera el tamano maximo permitido")

    extension = file.filename.rsplit(".", 1)[-1] if file.filename and "." in file.filename else "jpg"
    s3_key = f"projects/{project_id}/{uuid.uuid4()}.{extension}"

    s3_client = get_s3_client()
    s3_client.put_object(
        Bucket=settings.aws_s3_bucket,
        Key=s3_key,
        Body=content,
        ContentType=file.content_type,
    )

    next_order = db.scalar(
        select(ProjectImage.display_order).where(ProjectImage.project_id == project_id).order_by(ProjectImage.display_order.desc())
    )
    image = ProjectImage(project_id=project_id, s3_key=s3_key, display_order=(next_order or 0) + 1)
    db.add(image)
    db.commit()
    db.refresh(image)
    return image


@router.delete("/{project_id}/images/{image_id}", status_code=204)
def delete_project_image(
    project_id: int,
    image_id: int,
    db: Session = Depends(get_db),
    _admin: str = Depends(get_current_admin),
) -> None:
    image = db.get(ProjectImage, image_id)
    if image is None or image.project_id != project_id:
        raise HTTPException(status_code=404, detail="Imagen no encontrada")

    s3_client = get_s3_client()
    s3_client.delete_object(Bucket=settings.aws_s3_bucket, Key=image.s3_key)

    db.delete(image)
    db.commit()
