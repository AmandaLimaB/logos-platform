from fastapi import FastAPI, HTTPException, Depends, status
from sqlalchemy.orm import Session
import models, schemas, database

app = FastAPI(title="Logos API")

@app.patch("/api/v1/incidents/{incident_id}", response_model=schemas.IncidentResponse)
def update_incident_status(
    incident_id: int, 
    update_data: schemas.IncidentStatusUpdate, 
    db: Session = Depends(database.get_db)
):
    incident = db.query(models.Incident).filter(models.Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incidente não encontrado.")
    
    # Validação de concorrência: verifica se a versão bate
    if incident.version != update_data.expected_version:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Este incidente foi modificado por outro analista. Por favor, atualize a página."
        )
    
    # Atualiza o status e incrementa a versão
    incident.status = update_data.status
    incident.version += 1
    
    db.commit()
    db.refresh(incident)
    return incident