import grpc
from concurrent import futures
import task_pb2
import task_pb2_grpc

from aplikacija.task_service import TaskService
from infrastruktura.task_repository import TaskRepository


class TaskServiceServicer(task_pb2_grpc.TaskServiceServicer):

    def __init__(self):
        self.service = TaskService(TaskRepository())

    def CreateTask(self, request, context):
        task = self.service.create_task(
            request.title,
            request.description,
            request.user_id
        )

        return task_pb2.TaskResponse(
            task=task_pb2.Task(
                id=task.id,
                title=task.title,
                description=task.description,
                user_id=task.user_id,
                completed=task.completed
            )
        )


def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    task_pb2_grpc.add_TaskServiceServicer_to_server(
        TaskServiceServicer(), server
    )
    server.add_insecure_port("[::]:50052")
    server.start()
    server.wait_for_termination()


if __name__ == "__main__":
    serve()