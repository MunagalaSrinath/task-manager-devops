import { useEffect, useState } from "react";
import api from "./api";

function App() {
  const [tasks, setTasks] = useState([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("pending");

  const [editingTaskId, setEditingTaskId] = useState(null);
  const [loading, setLoading] = useState(true);

  // ==========================================
  // GET ALL TASKS
  // ==========================================
  const fetchTasks = async () => {
    try {
      const response = await api.get("/tasks");

      console.log("Tasks received:", response.data);

      setTasks(response.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load tasks when the page opens
  useEffect(() => {
    fetchTasks();
  }, []);

  // ==========================================
  // CREATE TASK
  // ==========================================
  const handleCreate = async (event) => {
    event.preventDefault();

    if (!title.trim() || !description.trim()) {
      alert("Please enter title and description.");
      return;
    }

    try {
      const response = await api.post("/tasks", {
        title: title.trim(),
        description: description.trim(),
        status: status,
      });

      console.log("Created task:", response.data);

      // Add new task to UI immediately
      setTasks((previousTasks) => [
        ...previousTasks,
        response.data,
      ]);

      // Clear form
      setTitle("");
      setDescription("");
      setStatus("pending");

    } catch (error) {
      console.error("Error creating task:", error);

      if (error.response) {
        console.error("Backend response:", error.response.data);
      }
    }
  };

  // ==========================================
  // START EDITING
  // ==========================================
  const handleEdit = (task) => {
    console.log("Editing task:", task);

    setEditingTaskId(task.id);

    setTitle(task.title);
    setDescription(task.description);

    // Load existing status
    setStatus(task.status || "pending");
  };

  // ==========================================
  // UPDATE TASK
  // ==========================================
  const handleUpdate = async (event) => {
    event.preventDefault();

    if (!title.trim() || !description.trim()) {
      alert("Please enter title and description.");
      return;
    }

    if (editingTaskId === null) {
      console.error("No task selected for editing.");
      return;
    }

    try {
      console.log("Updating task:", editingTaskId);

      const response = await api.put(
        `/tasks/${editingTaskId}`,
        {
          title: title.trim(),
          description: description.trim(),
          status: status,
        }
      );

      console.log("Updated task:", response.data);

      // Replace the old task with the updated task
      setTasks((previousTasks) =>
        previousTasks.map((task) =>
          task.id === editingTaskId
            ? response.data
            : task
        )
      );

      // Exit edit mode
      setEditingTaskId(null);

      // Clear form
      setTitle("");
      setDescription("");
      setStatus("pending");

    } catch (error) {
      console.error("Error updating task:", error);

      if (error.response) {
        console.error(
          "Backend error:",
          error.response.data
        );
      }
    }
  };

  // ==========================================
  // CANCEL EDIT
  // ==========================================
  const handleCancelEdit = () => {
    setEditingTaskId(null);

    setTitle("");
    setDescription("");
    setStatus("pending");
  };

  // ==========================================
  // DELETE TASK
  // ==========================================
  const handleDelete = async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`);

      console.log("Deleted task:", taskId);

      // Remove from UI immediately
      setTasks((previousTasks) =>
        previousTasks.filter(
          (task) => task.id !== taskId
        )
      );

      // If deleting the task currently being edited
      if (editingTaskId === taskId) {
        setEditingTaskId(null);
        setTitle("");
        setDescription("");
        setStatus("pending");
      }

    } catch (error) {
      console.error("Error deleting task:", error);

      if (error.response) {
        console.error(
          "Backend error:",
          error.response.data
        );
      }
    }
  };

  // ==========================================
  // FORM SUBMIT
  // ==========================================
  const handleSubmit = (event) => {
    if (editingTaskId !== null) {
      handleUpdate(event);
    } else {
      handleCreate(event);
    }
  };

  // ==========================================
  // UI
  // ==========================================
  return (
    <div>
      <h1>Task Manager</h1>

      {/* ======================================
          ADD / EDIT FORM
      ====================================== */}

      <form onSubmit={handleSubmit}>

        <h2>
          {editingTaskId !== null
            ? "Edit Task"
            : "Add New Task"}
        </h2>

        {/* TITLE */}

        <div>
          <label>Title</label>

          <br />

          <input
            type="text"
            placeholder="Enter task title"
            value={title}
            onChange={(event) =>
              setTitle(event.target.value)
            }
          />
        </div>

        <br />

        {/* DESCRIPTION */}

        <div>
          <label>Description</label>

          <br />

          <textarea
            placeholder="Enter task description"
            value={description}
            onChange={(event) =>
              setDescription(event.target.value)
            }
            rows="4"
            cols="40"
          />
        </div>

        <br />

        {/* STATUS */}

        <div>
          <label>Status</label>

          <br />

          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value)
            }
          >
            <option value="pending">
              Pending
            </option>

            <option value="in-progress">
              In Progress
            </option>

            <option value="completed">
              Completed
            </option>
          </select>
        </div>

        <br />

        {/* BUTTONS */}

        {editingTaskId !== null ? (
          <>
            <button type="submit">
              Update Task
            </button>

            {" "}

            <button
              type="button"
              onClick={handleCancelEdit}
            >
              Cancel Edit
            </button>
          </>
        ) : (
          <button type="submit">
            Add Task
          </button>
        )}

      </form>

      <hr />

      {/* ======================================
          TASK LIST
      ====================================== */}

      <h2>Tasks</h2>

      {loading ? (
        <p>Loading tasks...</p>
      ) : tasks.length === 0 ? (
        <p>No tasks found.</p>
      ) : (
        tasks.map((task) => (
          <div key={task.id}>

            <h3>{task.title}</h3>

            <p>{task.description}</p>

            <p>
              <strong>Status:</strong>{" "}
              {task.status}
            </p>

            <button
              type="button"
              onClick={() => handleEdit(task)}
            >
              Edit
            </button>

            {" "}

            <button
              type="button"
              onClick={() =>
                handleDelete(task.id)
              }
            >
              Delete
            </button>

            <hr />

          </div>
        ))
      )}
    </div>
  );
}

export default App;