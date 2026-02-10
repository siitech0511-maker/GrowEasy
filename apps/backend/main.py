from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.api import api_router
from core.config import settings
from core.database import engine, Base
import db_models.core
import db_models.accounting
import db_models.compliance
import db_models.sales
import db_models.purchasing
import db_models.inventory
import db_models.pos_banking
import db_models.crm_reporting
import db_models.admin_config
import db_models.hr_projects
import db_models.crm
import db_models.marketing

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from api.v1 import crm, marketing

app.include_router(api_router, prefix=settings.API_V1_STR)
app.include_router(crm.router, prefix="/api/v1/crm", tags=["crm"])
app.include_router(marketing.router, prefix="/api/v1/marketing", tags=["marketing"])

@app.get("/")
def read_root():
    return {"message": "Welcome to GrowEasy ERP API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
