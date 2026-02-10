"""Fix admin user password to use proper bcrypt hash."""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

import bcrypt
from sqlalchemy import text
from core.database import SessionLocal

db = SessionLocal()
hashed = bcrypt.hashpw("admin123".encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
db.execute(text("UPDATE users SET password_hash = :pw WHERE email = :email"), {"pw": hashed, "email": "admin@groweasy.in"})
db.commit()
db.close()
print(f"Updated admin@groweasy.in password hash to bcrypt.")
