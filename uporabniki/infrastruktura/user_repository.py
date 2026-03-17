from infrastruktura.database import SessionLocal
from infrastruktura.user_model import UserModel
from domena.user import User
from infrastruktura.logging_config import logger

class UserRepository:

    def create(self, user: User):
        logger.info("Saving user to repository")
        db = SessionLocal()
        try:
            db_user = UserModel(
                username=user.username,
                email=user.email,
                password=user.password
            )
            db.add(db_user)
            db.commit()
            db.refresh(db_user)
            return User(id=db_user.id, username=db_user.username, email=db_user.email, password=db_user.password)
        finally:
            db.close()

    def get_all(self):
        logger.info("Retrieving all users")
        db = SessionLocal()
        try:
            users = db.query(UserModel).all()
            return [User(id=u.id, username=u.username, email=u.email, password=u.password) for u in users]
        finally:
            db.close()

    def get_by_id(self, user_id: int):
        logger.info(f"Searching for user {user_id}")
        db = SessionLocal()
        try:
            u = db.query(UserModel).filter(UserModel.id == user_id).first()
            if u:
                return User(id=u.id, username=u.username, email=u.email, password=u.password)
        finally:
            db.close()

    def get_by_username(self, username: str):
        logger.info(f"Searching for user by username {username}")
        db = SessionLocal()
        try:
            u = db.query(UserModel).filter(UserModel.username == username).first()
            if u:
                return User(id=u.id, username=u.username, email=u.email, password=u.password)
        finally:
            db.close()