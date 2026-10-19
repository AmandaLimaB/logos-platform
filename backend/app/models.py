from sqlalchemy import Column, Integer, String, DateTime, Enum
from sqlalchemy.sql import func
import enum
from database import Base

class CriticalityEnum(str, enum.Enum):
    ALTA = "ALTA"
    MEDIA = "MEDIA"
    BAIXA = "BAIXA"

class CategoryEnum(str, enum.Enum):
    ACIDENTE_VEICULO = "Acidente com Veículo"
    ACIDENTE_VITIMAS = "Acidente com Vítimas"
    ACIDENTE_ANIMAL = "Acidente com Animal"
    PERDA_CARGA = "Derramamento de Carga"
    CLIMA_ATIPICO = "Condição Climática Atípica na Pista"
    PROBLEMA_MECANICO = "Problema Mecânico"
    BLOQUEIO_PISTA = "Bloqueio de Pista"

class StatusEnum(str, enum.Enum):
    ABERTO = "Aberto"
    EM_INVESTIGACAO = "Em Investigação"
    INCONCLUSIVO = "Inconclusivo"
    FECHADO = "Fechado"

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    category = Column(Enum(CategoryEnum), nullable=False, index=True)
    criticality = Column(Enum(CriticalityEnum), nullable=False, index=True)
    status = Column(Enum(StatusEnum), default=StatusEnum.ABERTO, index=True)
    location = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Controle de Concorrência Otimista
    version = Column(Integer, default=1, nullable=False)