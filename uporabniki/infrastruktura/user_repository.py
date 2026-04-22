import uporabniki.infrastruktura.database as db_module
from uporabniki.infrastruktura.user_model import UserModel
from uporabniki.domena.user import User
from uporabniki.infrastruktura.logging_config import logger
from sqlalchemy.orm import Session


class UserRepository:

    def __init__(self, db: Session | None = None):
        # omogoča dependency injection (testi, FastAPI)
        self.db = db or db_module.SessionLocal()

    # helper za mapiranje
    def _to_domain(self, u: UserModel) -> User:
        return User(
            id=u.id,
            username=u.username,
            email=u.email,
            password=u.password
        )

    def create(self, user: User):
        logger.info("Saving user to repository")
        db_user = UserModel(
            username=user.username,
            email=user.email,
            password=user.password
        )
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        return self._to_domain(db_user)

    def get_all(self):
        users = self.db.query(UserModel).all()
        return [self._to_domain(u) for u in users]

    def get_by_id(self, user_id: int):
        u = self.db.query(UserModel).filter(UserModel.id == user_id).first()
        return self._to_domain(u) if u else None

    def get_by_username(self, username: str):
        u = self.db.query(UserModel).filter(UserModel.username == username).first()
        return self._to_domain(u) if u else None

    def update(self, user: User):
        logger.info(f"Updating user {user.id}")
        u = self.db.query(UserModel).filter(UserModel.id == user.id).first()

        if not u:
            return None

        u.username = user.username
        u.email = user.email
        u.password = user.password

        self.db.commit()
        self.db.refresh(u)

        return self._to_domain(u)

    def delete(self, user_id: int):
        logger.info(f"Deleting user {user_id}")
        u = self.db.query(UserModel).filter(UserModel.id == user_id).first()

        if not u:
            return False

        self.db.delete(u)
        self.db.commit()
        return True

    def close(self):
        self.db.close()