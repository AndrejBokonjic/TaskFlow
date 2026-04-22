from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import asyncio

from http_client import users_client, projects_client, tasks_client, raise_for
import config

app = FastAPI(title="TaskFlow Mobile BFF", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Pydantic modeli ──────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    username: str
    password: str

class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str

class TaskStatusRequest(BaseModel):
    status: str  # TODO | IN_PROGRESS | DONE

class CreateTaskRequest(BaseModel):
    title: str
    description: Optional[str] = ""
    user_id: int
    project_id: Optional[int] = None

class CreateProjectRequest(BaseModel):
    name: str
    description: Optional[str] = ""
    owner_id: int

# ── Health ───────────────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    return {"status": "ok", "service": "mobile-bff"}

# ── Auth ─────────────────────────────────────────────────────────────────────

@app.post("/mobile/auth/login")
async def login(body: LoginRequest):
    async with users_client() as c:
        r = raise_for(await c.post("/auth/login", json=body.model_dump()))
    data = r.json()
    # mobilni odjemalec dobi samo nujne podatke
    return {
        "user_id": data["user_id"],
        "username": data["username"],
        "token": f"mock-token-{data['user_id']}",  # placeholder za JWT
    }

@app.post("/mobile/auth/register")
async def register(body: RegisterRequest):
    async with users_client() as c:
        r = raise_for(await c.post("/auth/register", json=body.model_dump()))
    return r.json()

# ── Projekti — kompakten seznam za mobilni prikaz ────────────────────────────

@app.get("/mobile/projects")
async def list_projects():
    async with projects_client() as c:
        r = raise_for(await c.get("/projects"))
    projects = r.json()
    # mobilni odjemalec dobi samo id, name, owner_id
    return [{"id": p["id"], "name": p["name"], "owner_id": p.get("ownerId") or p.get("owner_id")} for p in projects]

@app.post("/mobile/projects")
async def create_project(body: CreateProjectRequest):
    async with projects_client() as c:
        r = raise_for(await c.post("/projects", json=body.model_dump()))
    return r.json()

@app.get("/mobile/projects/{project_id}")
async def get_project(project_id: int):
    async with projects_client() as pc, tasks_client() as tc:
        proj_r, tasks_r = await asyncio.gather(
            pc.get(f"/projects/{project_id}"),
            tc.get(f"/tasks?project_id={project_id}"),
        )
    raise_for(proj_r)
    project = proj_r.json()
    tasks = tasks_r.json() if not tasks_r.is_error else []

    # kompaktni odgovor — samo kar mobilna app potrebuje
    return {
        "id": project["id"],
        "name": project["name"],
        "ownerId": project["ownerId"],
        "todo": sum(1 for t in tasks if t["status"] == "TODO"),
        "in_progress": sum(1 for t in tasks if t["status"] == "IN_PROGRESS"),
        "done": sum(1 for t in tasks if t["status"] == "DONE"),
        "total_tasks": len(tasks),
    }

# ── Naloge ───────────────────────────────────────────────────────────────────

@app.get("/mobile/tasks")
async def list_tasks(project_id: Optional[int] = None, user_id: Optional[int] = None):
    params = {}
    if project_id:
        params["project_id"] = project_id
    if user_id:
        params["user_id"] = user_id
    async with tasks_client() as c:
        r = raise_for(await c.get("/tasks", params=params))
    tasks = r.json()
    # mobilni odjemalec dobi samo nujne podatke brez description
    return [{"id": t["id"], "title": t["title"], "status": t["status"], "user_id": t["user_id"]} for t in tasks]

@app.post("/mobile/tasks")
async def create_task(body: CreateTaskRequest):
    async with tasks_client() as c:
        r = raise_for(await c.post("/tasks", json=body.model_dump()))
    t = r.json()
    return {"id": t["id"], "title": t["title"], "status": t["status"]}

@app.patch("/mobile/tasks/{task_id}/status")
async def update_task_status(task_id: int, body: TaskStatusRequest):
    async with tasks_client() as c:
        r = raise_for(await c.patch(f"/tasks/{task_id}/status", json=body.model_dump()))
    t = r.json()
    return {"id": t["id"], "title": t["title"], "status": t["status"]}

@app.delete("/mobile/tasks/{task_id}", status_code=204)
async def delete_task(task_id: int):
    async with tasks_client() as c:
        raise_for(await c.delete(f"/tasks/{task_id}"))

# ── Dashboard — agregirani prikaz za mobilno začetno stran ───────────────────

@app.get("/mobile/dashboard/{user_id}")
async def dashboard(user_id: int):
    async with users_client() as uc, tasks_client() as tc:
        user_r, tasks_r = await asyncio.gather(
            uc.get(f"/users/{user_id}"),
            tc.get(f"/tasks?user_id={user_id}"),
        )
    raise_for(user_r)
    user = user_r.json()
    tasks = tasks_r.json() if not tasks_r.is_error else []

    return {
        "username": user["username"],
        "my_tasks": {
            "todo": sum(1 for t in tasks if t["status"] == "TODO"),
            "in_progress": sum(1 for t in tasks if t["status"] == "IN_PROGRESS"),
            "done": sum(1 for t in tasks if t["status"] == "DONE"),
        },
        "recent_tasks": [
            {"id": t["id"], "title": t["title"], "status": t["status"]}
            for t in tasks[:5]
        ],
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=config.PORT, reload=True)
