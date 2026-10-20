from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import Optional
import sys
from pathlib import Path

# Garante importação dos enums de models
sys.path.append(str(Path(__file__).resolve().parent))
from models import CriticalityEnum, CategoryEnum, StatusEnum

class IncidentBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=200, description="Título conciso do incidente")
    description: str = Field(..., min_length=5, description="Detalhamento operacional da ocorrência")
    category: CategoryEnum = Field(..., description="Categoria do incidente")
    criticality: CriticalityEnum = Field(..., description="Criticidade: ALTA, MEDIA ou BAIXA")
    location: str = Field(..., min_length=2, max_length=255, description="Rodovia, KM ou referência de localização")

class IncidentCreate(IncidentBase):
    pass

class IncidentStatusUpdate(BaseModel):
    status: StatusEnum = Field(..., description="Novo status do incidente")
    expected_version: int = Field(..., description="Versão atual para validação de concorrência otimista")

class IncidentResponse(IncidentBase):
    id: int
    status: StatusEnum
    version: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
