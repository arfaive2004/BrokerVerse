from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas, security
router = APIRouter(prefix='/api/dashboard', tags=['dashboard'])
BASE_TOTAL_BROKERAGE=12_345_678.90; BASE_ACTIVE_CLIENTS=1254; BASE_NEW_CLIENTS=32
@router.get('/metrics', response_model=schemas.MetricsResponse)
def get_metrics(db: Session=Depends(get_db), current_user: Optional[models.User]=Depends(security.get_current_user_optional)):
    if not current_user:
        return schemas.MetricsResponse(total_brokerage=BASE_TOTAL_BROKERAGE,active_clients=BASE_ACTIVE_CLIENTS,new_clients=BASE_NEW_CLIENTS)
    clients=db.query(models.Client).filter(models.Client.owner_id==current_user.id).all()
    return schemas.MetricsResponse(total_brokerage=round(float(sum(c.profit or 0 for c in clients)),2),active_clients=len(clients),new_clients=len(clients))
@router.get('/top-clients', response_model=list[schemas.TopClientOut])
def get_top_clients(db: Session=Depends(get_db), current_user: Optional[models.User]=Depends(security.get_current_user_optional)):
    q=db.query(models.Client)
    clients=(q.filter(models.Client.owner_id==current_user.id).all() if current_user else q.filter(models.Client.is_demo==True).all())
    clients.sort(key=lambda c:c.profit or 0,reverse=True)
    return [schemas.TopClientOut(rank=i+1,name=c.full_name,profit=c.profit or 0,status=c.status or 'Up') for i,c in enumerate(clients[:5])]
