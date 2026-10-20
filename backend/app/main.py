import sys
from pathlib import Path
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import case

# Garante localização correta dos módulos irmãos
sys.path.append(str(Path(__file__).resolve().parent))

import models
import schemas
from database import engine, get_db

# Cria as tabelas no banco de dados automaticamente caso não existam
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Logos - Central de Resposta a Incidentes",
    description="API de missão crítica para gestão de incidentes logísticos em tempo real.",
    version="1.0.0"
)

# Configuração de CORS (Cross-Origin Resource Sharing)
# Permite ao front-end (React / Vite) consumir a API localmente ou em produção
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "message": "API Logos operacional.",
        "docs": "/docs",
        "health": "OK"
    }

# Rota GET: Listagem com Filtros e Priorização por Criticidade (Gestão por Exceção)
@app.get("/api/v1/incidents", response_model=List[schemas.IncidentResponse])
def get_incidents(
    criticality: Optional[models.CriticalityEnum] = Query(None, description="Filtrar por criticidade: ALTA, MEDIA, BAIXA"),
    category: Optional[models.CategoryEnum] = Query(None, description="Filtrar por categoria do incidente"),
    status_filter: Optional[models.StatusEnum] = Query(None, alias="status", description="Filtrar por status do ciclo de vida"),
    search: Optional[str] = Query(None, description="Busca textual em título, descrição ou localização"),
    db: Session = Depends(get_db)
):
    query = db.query(models.Incident)

    # Aplicação dos filtros dinâmicos
    if criticality:
        query = query.filter(models.Incident.criticality == criticality)
    if category:
        query = query.filter(models.Incident.category == category)
    if status_filter:
        query = query.filter(models.Incident.status == status_filter)
    if search:
        search_fmt = f"%{search}%"
        query = query.filter(
            (models.Incident.title.ilike(search_fmt)) |
            (models.Incident.description.ilike(search_fmt)) |
            (models.Incident.location.ilike(search_fmt))
        )

    # Ordenação Prioritária: ALTA em primeiro lugar, seguida de MEDIA e BAIXA
    # E dentro da mesma criticidade, os incidentes mais recentes aparecem primeiro
    criticality_order = case(
        (models.Incident.criticality == models.CriticalityEnum.ALTA, 1),
        (models.Incident.criticality == models.CriticalityEnum.MEDIA, 2),
        (models.Incident.criticality == models.CriticalityEnum.BAIXA, 3),
        else_=4
    )

    incidents = query.order_by(criticality_order, models.Incident.created_at.desc()).all()
    return incidents

# Rota GET: Obter incidente por ID
@app.get("/api/v1/incidents/{incident_id}", response_model=schemas.IncidentResponse)
def get_incident_by_id(
    incident_id: int,
    db: Session = Depends(get_db)
):
    incident = db.query(models.Incident).filter(models.Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incidente não encontrado.")
    return incident

# Rota POST: Criação de Novo Incidente
@app.post("/api/v1/incidents", response_model=schemas.IncidentResponse, status_code=status.HTTP_201_CREATED)
def create_incident(
    incident_in: schemas.IncidentCreate,
    db: Session = Depends(get_db)
):
    db_incident = models.Incident(
        title=incident_in.title,
        description=incident_in.description,
        category=incident_in.category,
        criticality=incident_in.criticality,
        location=incident_in.location,
        status=models.StatusEnum.ABERTO,
        version=1  # Inicializa o controle de concorrência na versão 1
    )
    
    db.add(db_incident)
    db.commit()
    db.refresh(db_incident)
    return db_incident

# Rota PATCH: Atualização de Status com Controle de Concorrência Otimista
@app.patch("/api/v1/incidents/{incident_id}", response_model=schemas.IncidentResponse)
def update_incident_status(
    incident_id: int, 
    update_data: schemas.IncidentStatusUpdate, 
    db: Session = Depends(get_db)
):
    incident = db.query(models.Incident).filter(models.Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incidente não encontrado.")
    
    # Validação de concorrência otimista: verifica se a versão informada pelo cliente bate com a versão do banco
    if incident.version != update_data.expected_version:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Conflito de Concorrência: este incidente foi modificado por outro analista em tempo real. Atualize a listagem para visualizar o estado atual."
        )
    
    # Atualiza o status e incrementa a versão
    incident.status = update_data.status
    incident.version += 1
    
    db.commit()
    db.refresh(incident)
    return incident

# Rota POST: Resetar / Re-popular banco com dados de exemplo (útil para testes e avaliação)
@app.post("/api/v1/seed/reset")
def reset_sample_data(db: Session = Depends(get_db)):
    db.query(models.Incident).delete()
    db.commit()
    from seed import seed_database
    seed_database()
    return {"message": "Base de dados restaurada com dados de exemplo com sucesso."}
