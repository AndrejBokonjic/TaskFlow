import sqlite3
from naloge.domena.task import Task

class TaskRepository:

    def __init__(self):
        self.conn = sqlite3.connect("tasks.db", check_same_thread=False)
        self.create_table()

    def create_table(self):
        self.conn.execute("""
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY,
            title TEXT,
            description TEXT,
            user_id INTEGER,
            completed BOOLEAN
        )
        """)

    def create(self, task):
        cursor = self.conn.execute(
            "INSERT INTO tasks (title, description, user_id, completed) VALUES (?, ?, ?, ?)",
            (task.title, task.description, task.user_id, task.completed)
        )
        task.id = cursor.lastrowid
        return task

    def get_by_id(self, task_id):
        cursor = self.conn.execute("SELECT * FROM tasks WHERE id=?", (task_id,))
        row = cursor.fetchone()
        if row:
            return Task(*row)

    def get_all(self):
        cursor = self.conn.execute("SELECT * FROM tasks")
        return [Task(*row) for row in cursor.fetchall()]

    def update(self, task):
        self.conn.execute(
            "UPDATE tasks SET completed=? WHERE id=?",
            (task.completed, task.id)
        )
        return task