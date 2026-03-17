from domena.user import User
from infrastruktura.logging_config import logger

class UserRepository:

    def __init__(self):
        self.users = []
        self.counter = 1

    def create(self, user: User):
        logger.info("Saving user to repository")

        user.id = self.counter
        self.counter += 1
        self.users.append(user)

        return user

    def get_all(self):
        logger.info("Retrieving all users")
        return self.users

    def get_by_id(self, user_id: int):
        logger.info(f"Searching for user {user_id}")

        for user in self.users:
            if user.id == user_id:
                return user

    def get_by_username(self, username: str):
        logger.info(f"Searching for user by username {username}")

        for user in self.users:
            if user.username == username:
                return user
            
            
    def get_by_email(self, email: str):
        logger.info(f"Searching for user by email {email}")

        for user in self.users:
            if user.email == email:
                return user