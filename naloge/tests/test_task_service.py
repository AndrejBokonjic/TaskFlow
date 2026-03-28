from aplikacija.task_service import TaskService
from infrastruktura.task_repository import TaskRepository

def test_create_task():
    service = TaskService(TaskRepository())
    task = service.create_task("Test", "Desc", 1)

    assert task.id is not None
    assert task.title == "Test"