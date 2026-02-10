"""Generate a JWT token for the admin user (bypasses broken passlib)."""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from datetime import datetime, timedelta
from jose import jwt
from core.config import settings

token = jwt.encode(
    {"exp": datetime.utcnow() + timedelta(days=30), "sub": "admin@groweasy.in"},
    settings.SECRET_KEY,
    algorithm=settings.ALGORITHM,
)
print(f"\nJWT Token for admin@groweasy.in:\n")
print(token)
print(f"\nPaste this in browser console:\nlocalStorage.setItem('token', '{token}')")
print(f"\nThen refresh the page.")
