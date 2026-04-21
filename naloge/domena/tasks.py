from enum import Enum

class TaskStatus(str, Enum):
    TODO = "TODO"
    IN_PROGRESS = "IN_PROGRESS"
    DONE = "DONE"

class Task:
    def __init__(self, id, title, description, user_id, project_id=None, status=TaskStatus.TODO):
        self.id = id
        self.title = title
        self.description = description
        self.user_id = user_id
        self.project_id = project_id
        self.status = status if isinstance(status, TaskStatus) else TaskStatus(status)

    @property
    def completed(self):
        return self.status == TaskStatus.DONE
