import grpc
from concurrent import futures
import logging
from naloge.grpc import task_pb2, task_pb2_grpc
from naloge.aplikacija.task_service import TaskService
from naloge.infrastruktura.task_repository import TaskRepository

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TaskServiceServicer(task_pb2_grpc.TaskServiceServicer):
    def __init__(self):
        self.service = TaskService(TaskRepository())

    def CreateTask(self, request, context):
        logger.info(f"CreateTask called: title={request.title}, user_id={request.user_id}")
        task = self.service.create_task(request.title, request.description, request.user_id)
        return task_pb2.TaskResponse(task=task_pb2.Task(
            id=task.id, title=task.title, description=task.description,
            user_id=task.user_id, completed=task.completed
        ))

    def GetTask(self, request, context):
        logger.info(f"GetTask called: id={request.id}")
        task = self.service.get_task(request.id)
        if not task:
            context.set_code(grpc.StatusCode.NOT_FOUND)
            context.set_details("Task not found")
            return task_pb2.TaskResponse()
        return task_pb2.TaskResponse(task=task_pb2.Task(
            id=task.id, title=task.title, description=task.description,
            user_id=task.user_id, completed=task.completed
        ))

    def ListTasks(self, request, context):
        logger.info("ListTasks called")
        tasks = self.service.list_tasks()
        return task_pb2.TaskList(tasks=[
            task_pb2.Task(id=t.id, title=t.title, description=t.description,
                          user_id=t.user_id, completed=t.completed)
            for t in tasks
        ])

    def CompleteTask(self, request, context):
        logger.info(f"CompleteTask called: id={request.id}")
        task = self.service.complete_task(request.id)
        if not task:
            context.set_code(grpc.StatusCode.NOT_FOUND)
            context.set_details("Task not found")
            return task_pb2.TaskResponse()
        return task_pb2.TaskResponse(task=task_pb2.Task(
            id=task.id, title=task.title, description=task.description,
            user_id=task.user_id, completed=task.completed
        ))

def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    task_pb2_grpc.add_TaskServiceServicer_to_server(TaskServiceServicer(), server)
    server.add_insecure_port("[::]:50052")
    logger.info("gRPC server starting on port 50052")
    server.start()
    server.wait_for_termination()

if __name__ == "__main__":
    serve()