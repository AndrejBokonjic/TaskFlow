# uporabniki/api/health.py
# VZOREC: Vmesnik za preverjanje stanja (Health Check)
# Vrne stanje storitve in odvisnosti (baza podatkov).

from fastapi import APIRouter
from sqlalchemy import text
from uporabniki.infrastruktura.database import SessionLocal

router = APIRouter()

@router.get("/health")
def health_check():
    """
    Preveri stanje storitve uporabnikov.
    - Preveri povezavo z bazo podatkov
    - Vrne UP/DOWN za vsako odvisnost
    """
    db_status = "UP"
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
    except Exception as e:
        db_status = f"DOWN: {str(e)}"

    overall = "UP" if db_status == "UP" else "DEGRADED"

    return {
        "status": overall,
        "service": "uporabniki",
        "dependencies": {
            "database": db_status,
        }
    }
