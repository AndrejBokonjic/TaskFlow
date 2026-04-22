import httpx
from fastapi import HTTPException
from config import USERS_URL, PROJECTS_URL, TASKS_URL

def users_client():
    return httpx.AsyncClient(base_url=USERS_URL, timeout=5.0)

def projects_client():
    return httpx.AsyncClient(base_url=PROJECTS_URL, timeout=5.0)

def tasks_client():
    return httpx.AsyncClient(base_url=TASKS_URL, timeout=5.0)

def raise_for(response: httpx.Response):
    if response.is_error:
        try:
            detail = response.json().get("detail") or response.json().get("error") or response.text
        except Exception:
            detail = response.text
        raise HTTPException(status_code=response.status_code, detail=detail)
    return response
