import logging
import grpc
from flask import Flask, jsonify, request
from naloge.grpc import task_pb2, task_pb2_grpc

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

def get_stub():
    channel = grpc.insecure_channel("localhost:50052")
    return task_pb2_grpc.TaskServiceStub(channel)

@app.route("/tasks", methods=["GET"])
def list_tasks():
    logger.info("GET /tasks")
    stub = get_stub()
    response = stub.ListTasks(task_pb2.Empty())
    return jsonify([{
        "id": t.id, "title": t.title, "description": t.description,
        "user_id": t.user_id, "completed": t.completed
    } for t in response.tasks])

@app.route("/tasks", methods=["POST"])
def create_task():
    data = request.get_json()
    logger.info(f"POST /tasks: {data}")
    stub = get_stub()
    response = stub.CreateTask(task_pb2.CreateTaskRequest(
        title=data["title"],
        description=data["description"],
        user_id=data["user_id"]
    ))
    t = response.task
    return jsonify({
        "id": t.id, "title": t.title, "description": t.description,
        "user_id": t.user_id, "completed": t.completed
    }), 201

@app.route("/tasks/<int:task_id>", methods=["GET"])
def get_task(task_id):
    logger.info(f"GET /tasks/{task_id}")
    stub = get_stub()
    response = stub.GetTask(task_pb2.GetTaskRequest(id=task_id))
    t = response.task
    if not t.id:
        return jsonify({"error": "Not found"}), 404
    return jsonify({
        "id": t.id, "title": t.title, "description": t.description,
        "user_id": t.user_id, "completed": t.completed
    })

@app.route("/tasks/<int:task_id>/complete", methods=["PATCH"])
def complete_task(task_id):
    logger.info(f"PATCH /tasks/{task_id}/complete")
    stub = get_stub()
    response = stub.CompleteTask(task_pb2.CompleteTaskRequest(id=task_id))
    t = response.task
    if not t.id:
        return jsonify({"error": "Not found"}), 404
    return jsonify({
        "id": t.id, "title": t.title, "description": t.description,
        "user_id": t.user_id, "completed": t.completed
    })

if __name__ == "__main__":
    app.run(port=5001)