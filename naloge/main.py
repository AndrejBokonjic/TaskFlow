import logging
import grpc
from flask import Flask, jsonify, request
from naloge.grpc import task_pb2, task_pb2_grpc

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

def get_stub():
    GRPC_HOST = os.getenv("GRPC_HOST", "localhost")
    channel = grpc.insecure_channel(f"{GRPC_HOST}:50052")
    return task_pb2_grpc.TaskServiceStub(channel)

def task_to_dict(t):
    return {
        "id": t.id,
        "title": t.title,
        "description": t.description,
        "user_id": t.user_id,
        "project_id": t.project_id,
        "status": t.status,
        "completed": t.completed,
    }

@app.route("/tasks", methods=["GET"])
def list_tasks():
    project_id = request.args.get("project_id", type=int)
    user_id = request.args.get("user_id", type=int)
    stub = get_stub()
    if project_id:
        response = stub.ListTasksByProject(task_pb2.ListByProjectRequest(project_id=project_id))
    elif user_id:
        response = stub.ListTasksByUser(task_pb2.ListByUserRequest(user_id=user_id))
    else:
        response = stub.ListTasks(task_pb2.Empty())
    return jsonify([task_to_dict(t) for t in response.tasks])

@app.route("/tasks", methods=["POST"])
def create_task():
    data = request.get_json()
    stub = get_stub()
    response = stub.CreateTask(task_pb2.CreateTaskRequest(
        title=data["title"],
        description=data.get("description", ""),
        user_id=data["user_id"],
        project_id=data.get("project_id", 0),
    ))
    return jsonify(task_to_dict(response.task)), 201

@app.route("/tasks/<int:task_id>", methods=["GET"])
def get_task(task_id):
    stub = get_stub()
    response = stub.GetTask(task_pb2.GetTaskRequest(id=task_id))
    if not response.task.id:
        return jsonify({"error": "Not found"}), 404
    return jsonify(task_to_dict(response.task))

@app.route("/tasks/<int:task_id>", methods=["PUT"])
def update_task(task_id):
    data = request.get_json()
    stub = get_stub()
    response = stub.UpdateTask(task_pb2.UpdateTaskRequest(
        id=task_id,
        title=data.get("title", ""),
        description=data.get("description", ""),
        user_id=data.get("user_id", 0),
        project_id=data.get("project_id", 0),
    ))
    if not response.task.id:
        return jsonify({"error": "Not found"}), 404
    return jsonify(task_to_dict(response.task))

@app.route("/tasks/<int:task_id>/status", methods=["PATCH"])
def set_status(task_id):
    data = request.get_json()
    status_map = {"TODO": 0, "IN_PROGRESS": 1, "DONE": 2}
    status_val = status_map.get(data.get("status", "").upper())
    if status_val is None:
        return jsonify({"error": "Invalid status. Use TODO, IN_PROGRESS or DONE"}), 400
    stub = get_stub()
    response = stub.SetTaskStatus(task_pb2.SetStatusRequest(id=task_id, status=status_val))
    if not response.task.id:
        return jsonify({"error": "Not found"}), 404
    return jsonify(task_to_dict(response.task))

@app.route("/tasks/<int:task_id>/complete", methods=["PATCH"])
def complete_task(task_id):
    stub = get_stub()
    response = stub.CompleteTask(task_pb2.CompleteTaskRequest(id=task_id))
    if not response.task.id:
        return jsonify({"error": "Not found"}), 404
    return jsonify(task_to_dict(response.task))

@app.route("/tasks/<int:task_id>", methods=["DELETE"])
def delete_task(task_id):
    stub = get_stub()
    response = stub.DeleteTask(task_pb2.DeleteTaskRequest(id=task_id))
    if not response.success:
        return jsonify({"error": "Not found"}), 404
    return "", 204

if __name__ == "__main__":
    app.run(port=5001)
