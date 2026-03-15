from domena.user import User

class UserRepository:

    def __init__(self):
        self.users = []
        self.counter = 1

    def create(self, user: User):
        user.id = self.counter
        self.counter += 1
        self.users.append(user)
        return user

    def get_all(self):
        return self.users

    def get_by_id(self, user_id: int):
        for user in self.users:
            if user.id == user_id:
                return user
