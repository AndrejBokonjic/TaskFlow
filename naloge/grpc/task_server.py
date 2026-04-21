import grpc
from concurrent import futures
import logging
from naloge.grpc import task_pb2, task_pb2_grpc
from naloge.aplikacija.task_service import TaskService
from naloge.infrastruktura.task_repository import TaskRepository
from naloge.domena.tasks import TaskStatus

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

STATUS_TO_PROTO = {
    TaskStatus.TODO: task_pb2.TODO,
    TaskStatus.IN_PROGRESS: task_pb2.IN_PROGRESS,
    TaskStatus.DONE: task_pb2.DONE,
}

STATUS_FROM_PROTO = {
    task_pb2.TODO: TaskStatus.TODO,
    task_pb2.IN_PROGRESS: TaskStatus.IN_PROGRESS,
    task_pb2.DONE: TaskStatus.DONE,
}

def task_to_proto(task):
    return task_pb2.Task(
        id=task.id,
        title=task.title,
        description=task.description,
        user_id=task.user_id,
        project_id=task.project_id or 0,
        status=STATUS_TO_PROTO.get(task.status, task_pb2.TODO),
        completed=task.completed,
    )

class TaskServiceServicer(task_pb2_grpc.TaskServiceServicer):
    def __init__(self):
        self.service = TaskService(TaskRepository())

    def CreateTask(self, request, context):
        logger.info(f"CreateTask: title={request.title}, project_id={request.project_id}")
        task = self.service.create_task(
            request.title, request.description,
            request.user_id, request.project_id or None
        )
        return task_pb2.TaskResponse(task=task_to_proto(task))

    def GetTask(self, request, context):
        task = self.service.get_task(request.id)
        if not task:
            context.set_code(grpc.StatusCode.NOT_FOUND)
            context.set_details("Task not found")
            return task_pb2.TaskResponse()
        return task_pb2.TaskResponse(task=task_to_proto(task))

    def ListTasks(self, request, context):
        tasks = self.service.list_tasks()
        return task_pb2.TaskList(tasks=[task_to_proto(t) for t in tasks])

    def ListTasksByProject(self, request, context):
        tasks = self.service.list_tasks_by_project(request.project_id)
        return task_pb2.TaskList(tasks=[task_to_proto(t) for t in tasks])

    def ListTasksByUser(self, request, context):
        tasks = self.service.list_tasks_by_user(request.user_id)
        return task_pb2.TaskList(tasks=[task_to_proto(t) for t in tasks])

    def UpdateTask(self, request, context):
        task = self.service.update_task(
            request.id,
            title=request.title or None,
            description=request.description or None,
            user_id=request.user_id or None,
            project_id=request.project_id or None,
        )
        if not task:
            context.set_code(grpc.StatusCode.NOT_FOUND)
            context.set_details("Task not found")
            return task_pb2.TaskResponse()
        return task_pb2.TaskResponse(task=task_to_proto(task))

    def SetTaskStatus(self, request, context):
        status = STATUS_FROM_PROTO.get(request.status, TaskStatus.TODO)
        task = self.service.set_status(request.id, status)
        if not task:
            context.set_code(grpc.StatusCode.NOT_FOUND)
            context.set_details("Task not found")
            return task_pb2.TaskResponse()
        return task_pb2.TaskResponse(task=task_to_proto(task))

    def CompleteTask(self, request, context):
        task = self.service.complete_task(request.id)
        if not task:
            context.set_code(grpc.StatusCode.NOT_FOUND)
            context.set_details("Task not found")
            return task_pb2.TaskResponse()
        return task_pb2.TaskResponse(task=task_to_proto(task))

    def DeleteTask(self, request, context):
        success = self.service.delete_task(request.id)
        if not success:
            context.set_code(grpc.StatusCode.NOT_FOUND)
            context.set_details("Task not found")
        return task_pb2.DeleteTaskResponse(success=success)

def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    task_pb2_grpc.add_TaskServiceServicer_to_server(TaskServiceServicer(), server)
    server.add_insecure_port("[::]:50052")
    logger.info("gRPC server starting on port 50052")
    server.start()
    server.wait_for_termination()

if __name__ == "__main__":
    serve()
