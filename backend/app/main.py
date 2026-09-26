from fastapi import FastAPI

from app.routes.tasks import router as tasks_router

app = FastAPI(
    title="Task Manager API",
    description="Task Manager application for learning DevOps",
    version="1.0.0"
)


@app.get("/")
def root():
    return {"message": "Task Manager API is running"}


@app.get("/db-test")
def database_test():
    from app.database import get_connection

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("SELECT 1")
    result = cursor.fetchone()

    cursor.close()
    connection.close()

    return {
        "database": "connected",
        "result": result[0]
    }


app.include_router(tasks_router)