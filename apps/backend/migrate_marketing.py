"""
Migration script to create marketing tables and seed initial data
"""
from core.database import engine, SessionLocal
from db_models.base import Base
import db_models.marketing
from db_models.marketing import LeadQualificationRule, CategoryWeight, LeadSourceConfig
from datetime import datetime
import json


def create_tables():
    """Create all marketing tables"""
    print("Creating marketing tables...")
    Base.metadata.create_all(bind=engine)
    print("✓ Tables created successfully")


def seed_qualification_rules(db):
    """Seed default qualification rules"""
    print("Seeding qualification rules...")
    
    default_rule = LeadQualificationRule(
        rule_name="Default - No Website Businesses",
        min_rating=4.0,
        min_reviews=50,
        website_required=False,  # False means we want businesses WITHOUT websites
        phone_required=True,
        excluded_categories=json.dumps([]),
        min_lead_score=0,
        is_active=True,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    db.add(default_rule)
    db.commit()
    print("✓ Qualification rules seeded")


def seed_category_weights(db):
    """Seed default category weights"""
    print("Seeding category weights...")
    
    categories = [
        {"category": "Restaurant", "weight": 20, "description": "Food & Beverage establishments"},
        {"category": "Manufacturer", "weight": 25, "description": "Manufacturing businesses"},
        {"category": "Salon", "weight": 15, "description": "Beauty & wellness services"},
        {"category": "Retail", "weight": 10, "description": "Retail stores"},
        {"category": "Wholesaler", "weight": 22, "description": "Wholesale businesses"},
        {"category": "Trader", "weight": 18, "description": "Trading companies"},
        {"category": "Service Provider", "weight": 12, "description": "Service-based businesses"},
        {"category": "Healthcare", "weight": 16, "description": "Medical & healthcare services"},
        {"category": "Education", "weight": 14, "description": "Educational institutions"},
        {"category": "Real Estate", "weight": 19, "description": "Property & real estate"},
    ]
    
    for cat_data in categories:
        category = CategoryWeight(
            category=cat_data["category"],
            weight=cat_data["weight"],
            description=cat_data["description"],
            is_active=True,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        db.add(category)
    
    db.commit()
    print("✓ Category weights seeded")


def seed_source_configs(db):
    """Seed default source configurations"""
    print("Seeding source configurations...")
    
    sources = [
        {
            "source_name": "Google Maps",
            "api_endpoint": "https://maps.googleapis.com/maps/api/place",
            "daily_quota": 1000,
            "source_weight": 10,
            "is_active": False,  # Inactive until API key is configured
            "config_json": json.dumps({
                "radius_default": 5000,
                "min_rating": 4.0,
                "min_reviews": 50
            })
        },
        {
            "source_name": "Justdial",
            "api_endpoint": "",
            "daily_quota": 500,
            "source_weight": 8,
            "is_active": False,
            "config_json": json.dumps({
                "scrape_delay": 2,
                "max_pages": 10
            })
        },
        {
            "source_name": "IndiaMART",
            "api_endpoint": "",
            "daily_quota": 300,
            "source_weight": 12,
            "is_active": False,
            "config_json": json.dumps({
                "target_types": ["Manufacturer", "Wholesaler", "Trader"]
            })
        },
        {
            "source_name": "Facebook",
            "api_endpoint": "https://graph.facebook.com",
            "daily_quota": 500,
            "source_weight": 6,
            "is_active": False,
            "config_json": json.dumps({
                "fields": ["name", "category", "phone", "location", "website"]
            })
        },
        {
            "source_name": "Manual",
            "api_endpoint": "",
            "daily_quota": 999999,
            "source_weight": 5,
            "is_active": True,
            "config_json": json.dumps({})
        }
    ]
    
    for source_data in sources:
        source = LeadSourceConfig(
            source_name=source_data["source_name"],
            api_endpoint=source_data["api_endpoint"],
            daily_quota=source_data["daily_quota"],
            source_weight=source_data["source_weight"],
            is_active=source_data["is_active"],
            config_json=source_data["config_json"],
            requests_today=0,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        db.add(source)
    
    db.commit()
    print("✓ Source configurations seeded")


def main():
    """Run migration"""
    print("\n" + "="*50)
    print("Marketing Module Migration")
    print("="*50 + "\n")
    
    # Create tables
    create_tables()
    
    # Seed data
    db = SessionLocal()
    try:
        seed_qualification_rules(db)
        seed_category_weights(db)
        seed_source_configs(db)
        
        print("\n" + "="*50)
        print("✓ Migration completed successfully!")
        print("="*50 + "\n")
        
    except Exception as e:
        print(f"\n✗ Error during migration: {str(e)}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    main()
