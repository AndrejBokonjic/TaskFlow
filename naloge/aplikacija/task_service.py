from domena.task import Task

class TaskService:

    def __init__(self, repo):
        self.repo = repo

    def create_task(self, title, description, user_id):
        task = Task(None, title, description, user_id, False)
        return self.repo.create(task)

    def get_task(self, task_id):
        return self.repo.get_by_id(task_id)

    def list_tasks(self):
        return self.repo.get_all()

    def complete_task(self, task_id):
        task = self.repo.get_by_id(task_id)
        task.completed = True
        return self.repo.update(task)