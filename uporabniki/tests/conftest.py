import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from infrastruktura.database import Base
import infrastruktura.user_model
import infrastruktura.database as db_module

TEST_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)

@pytest.fixture(autouse=True)
def isolate_db():
    db_module.SessionLocal = TestingSessionLocal
    yield
    db = TestingSessionLocal()
    try:
        for table in reversed(Base.metadata.sorted_tables):
            db.execute(table.delete())
        db.commit()
    finally:
        db.close()