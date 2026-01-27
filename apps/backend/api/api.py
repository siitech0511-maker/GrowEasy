from fastapi import APIRouter
from api.v1 import auth, accounting, compliance

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(accounting.router, prefix="/accounting", tags=["accounting"])
api_router.include_router(compliance.router, prefix="/compliance", tags=["compliance"])
