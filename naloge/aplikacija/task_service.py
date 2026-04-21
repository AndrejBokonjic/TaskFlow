from naloge.domena.tasks import Task, TaskStatus

class TaskService:

    def __init__(self, repo):
        self.repo = repo

    def create_task(self, title, description, user_id, project_id=None):
        task = Task(None, title, description, user_id, project_id, TaskStatus.TODO)
        return self.repo.create(task)

    def get_task(self, task_id):
        return self.repo.get_by_id(task_id)

    def list_tasks(self):
        return self.repo.get_all()

    def list_tasks_by_project(self, project_id):
        return self.repo.get_by_project(project_id)

    def list_tasks_by_user(self, user_id):
        return self.repo.get_by_user(user_id)

    def update_task(self, task_id, title=None, description=None, user_id=None, project_id=None):
        task = self.repo.get_by_id(task_id)
        if not task:
            return None
        if title is not None:
            task.title = title
        if description is not None:
            task.description = description
        if user_id is not None:
            task.user_id = user_id
        if project_id is not None:
            task.project_id = project_id
        return self.repo.update(task)

    def set_status(self, task_id, status: TaskStatus):
        task = self.repo.get_by_id(task_id)
        if not task:
            return None
        task.status = status
        return self.repo.update(task)

    def complete_task(self, task_id):
        return self.set_status(task_id, TaskStatus.DONE)

    def delete_task(self, task_id):
        return self.repo.delete(task_id)
