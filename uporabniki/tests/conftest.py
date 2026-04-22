import os
import pytest

@pytest.fixture(autouse=True)
def isolated_db(tmp_path):
    db_file = tmp_path / "test.db"
    url = f"sqlite:///{db_file}"
    os.environ["DATABASE_URL"] = url

    import importlib
    import uporabniki.infrastruktura.database as db_module
    import uporabniki.infrastruktura.user_model  # noqa

    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker

    engine = create_engine(url, connect_args={"check_same_thread": False})
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    db_module.engine = engine
    db_module.SessionLocal = TestingSessionLocal
    db_module.Base.metadata.create_all(bind=engine)

    yield

    db_module.Base.metadata.drop_all(bind=engine)
    engine.dispose()
    del os.environ["DATABASE_URL"]