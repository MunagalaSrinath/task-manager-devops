from fastapi import APIRouter

from app.database import get_connection
from app.models import TaskCreate, TaskUpdate

router = APIRouter(
    prefix="/tasks",
    tags=["Tasks"]
)


@router.get("")
def get_tasks():
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT id, title, description, status, created_at
        FROM tasks
        ORDER BY id
        """
    )

    rows = cursor.fetchall()

    cursor.close()
    connection.close()

    tasks = []

    for row in rows:
        tasks.append({
            "id": row[0],
            "title": row[1],
            "description": row[2],
            "status": row[3],
            "created_at": row[4],
        })

    return tasks


@router.get("/{task_id}")
def get_task(task_id: int):
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT id, title, description, status, created_at
        FROM tasks
        WHERE id = %s
        """,
        (task_id,)
    )

    row = cursor.fetchone()

    cursor.close()
    connection.close()

    if row is None:
        return {"message": "Task not found"}

    return {
        "id": row[0],
        "title": row[1],
        "description": row[2],
        "status": row[3],
        "created_at": row[4],
    }


@router.post("")
def create_task(task: TaskCreate):
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        INSERT INTO tasks (title, description, status)
        VALUES (%s, %s, %s)
        RETURNING id, title, description, status, created_at
        """,
        (task.title, task.description, task.status)
    )

    row = cursor.fetchone()

    connection.commit()

    cursor.close()
    connection.close()

    return {
        "id": row[0],
        "title": row[1],
        "description": row[2],
        "status": row[3],
        "created_at": row[4],
    }


@router.put("/{task_id}")
def update_task(task_id: int, task: TaskUpdate):
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        UPDATE tasks
        SET title = %s,
            description = %s,
            status = %s
        WHERE id = %s
        RETURNING id, title, description, status, created_at
        """,
        (
            task.title,
            task.description,
            task.status,
            task_id
        )
    )

    row = cursor.fetchone()

    if row is None:
        cursor.close()
        connection.close()
        return {"message": "Task not found"}

    connection.commit()

    cursor.close()
    connection.close()

    return {
        "id": row[0],
        "title": row[1],
        "description": row[2],
        "status": row[3],
        "created_at": row[4],
    }


@router.delete("/{task_id}")
def delete_task(task_id: int):
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        DELETE FROM tasks
        WHERE id = %s
        RETURNING id
        """,
        (task_id,)
    )

    row = cursor.fetchone()

    if row is None:
        cursor.close()
        connection.close()
        return {"message": "Task not found"}

    connection.commit()

    cursor.close()
    connection.close()

    return {
        "message": "Task deleted successfully",
        "id": row[0]
    }