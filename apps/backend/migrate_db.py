from sqlalchemy import create_engine
from core.config import settings
from db_models.base import Base
# Import all models to ensure they are registered with Base.metadata
from db_models import crm, accounting  # transactions might be in accounting or other files

def migrate():
    print(f"Connecting to database at {settings.DATABASE_URL}...")
    engine = create_engine(settings.DATABASE_URL)
    
    print("Creating all missing tables...")
    Base.metadata.create_all(bind=engine)
    print("Database migration completed successfully.")

if __name__ == "__main__":
    migrate()
