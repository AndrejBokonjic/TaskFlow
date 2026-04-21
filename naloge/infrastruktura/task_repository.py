import sqlite3
from naloge.domena.tasks import Task, TaskStatus

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
            project_id INTEGER,
            status TEXT DEFAULT 'TODO'
        )
        """)
        self._migrate()
        self.conn.commit()

    def _migrate(self):
        cursor = self.conn.execute("PRAGMA table_info(tasks)")
        columns = [row[1] for row in cursor.fetchall()]
        if "project_id" not in columns:
            self.conn.execute("ALTER TABLE tasks ADD COLUMN project_id INTEGER")
        if "status" not in columns:
            self.conn.execute("ALTER TABLE tasks ADD COLUMN status TEXT DEFAULT 'TODO'")
        if "completed" in columns:
            self.conn.execute("""
                UPDATE tasks SET status = CASE
                    WHEN completed = 1 THEN 'DONE'
                    ELSE 'TODO'
                END WHERE status IS NULL OR status = ''
            """)

    def create(self, task):
        cursor = self.conn.execute(
            "INSERT INTO tasks (title, description, user_id, project_id, status) VALUES (?, ?, ?, ?, ?)",
            (task.title, task.description, task.user_id, task.project_id, task.status.value)
        )
        self.conn.commit()
        task.id = cursor.lastrowid
        return task

    def get_by_id(self, task_id):
        cursor = self.conn.execute("SELECT id, title, description, user_id, project_id, status FROM tasks WHERE id=?", (task_id,))
        row = cursor.fetchone()
        if row:
            return Task(row[0], row[1], row[2], row[3], row[4], row[5])

    def get_all(self):
        cursor = self.conn.execute("SELECT id, title, description, user_id, project_id, status FROM tasks")
        return [Task(r[0], r[1], r[2], r[3], r[4], r[5]) for r in cursor.fetchall()]

    def get_by_project(self, project_id):
        cursor = self.conn.execute(
            "SELECT id, title, description, user_id, project_id, status FROM tasks WHERE project_id=?",
            (project_id,)
        )
        return [Task(r[0], r[1], r[2], r[3], r[4], r[5]) for r in cursor.fetchall()]

    def get_by_user(self, user_id):
        cursor = self.conn.execute(
            "SELECT id, title, description, user_id, project_id, status FROM tasks WHERE user_id=?",
            (user_id,)
        )
        return [Task(r[0], r[1], r[2], r[3], r[4], r[5]) for r in cursor.fetchall()]

    def update(self, task):
        self.conn.execute(
            "UPDATE tasks SET title=?, description=?, user_id=?, project_id=?, status=? WHERE id=?",
            (task.title, task.description, task.user_id, task.project_id, task.status.value, task.id)
        )
        self.conn.commit()
        return task

    def delete(self, task_id):
        result = self.conn.execute("DELETE FROM tasks WHERE id=?", (task_id,))
        self.conn.commit()
        return result.rowcount > 0
