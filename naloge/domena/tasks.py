class Task:
    def __init__(self, id, title, description, user_id, completed=False):
        self.id = id
        self.title = title
        self.description = description
        self.user_id = user_id
        self.completed = completed