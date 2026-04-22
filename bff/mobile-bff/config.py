import os
from dotenv import load_dotenv

load_dotenv()

USERS_URL = os.getenv("USERS_URL", "http://localhost:8000")
PROJECTS_URL = os.getenv("PROJECTS_URL", "http://localhost:3000")
TASKS_URL = os.getenv("TASKS_URL", "http://localhost:5001")
PORT = int(os.getenv("PORT", 4001))
