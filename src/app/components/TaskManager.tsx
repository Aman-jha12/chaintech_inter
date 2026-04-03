"use client";

import { signIn, useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";

type Task = {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  dueDate: string | null;
  category: string | null;
  createdAt: string;
  updatedAt: string;
};

type TaskPayload = {
  title: string;
  description?: string | null;
  dueDate?: string | null;
  category?: string | null;
};

const formatDateTime = (iso: string | null) => {
  if (!iso) return "-";
  return new Date(iso).toLocaleString();
};

const toIsoDateTime = (value: string) => {
  if (!value) return null;
  return new Date(value).toISOString();
};

export default function TaskManager() {
  const { data: session, status } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [actionLoadingTaskId, setActionLoadingTaskId] = useState<string | null>(
    null
  );
  const [error, setError] = useState<string>("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [category, setCategory] = useState("");

  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingDescription, setEditingDescription] = useState("");
  const [editingDueDate, setEditingDueDate] = useState("");
  const [editingCategory, setEditingCategory] = useState("");

  const pendingCount = useMemo(
    () => tasks.filter((task) => !task.completed).length,
    [tasks]
  );

  const completedCount = useMemo(
    () => tasks.filter((task) => task.completed).length,
    [tasks]
  );

  const fetchTasks = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/tasks", { method: "GET" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch tasks");
      }

      setTasks(data.tasks || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchTasks();
    }
  }, [status]);

  const createTask = async () => {
    setFormLoading(true);
    setError("");

    try {
      const payload: TaskPayload = {
        title,
        description: description || null,
        dueDate: toIsoDateTime(dueDate),
        category: category || null,
      };

      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create task");
      }

      setTasks((prev) => [data.task, ...prev]);
      setTitle("");
      setDescription("");
      setDueDate("");
      setCategory("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create task");
    } finally {
      setFormLoading(false);
    }
  };

  const deleteTask = async (taskId: string) => {
    setActionLoadingTaskId(taskId);
    setError("");

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete task");
      }

      setTasks((prev) => prev.filter((task) => task.id !== taskId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete task");
    } finally {
      setActionLoadingTaskId(null);
    }
  };

  const markCompleted = async (taskId: string) => {
    setActionLoadingTaskId(taskId);
    setError("");

    try {
      const response = await fetch(`/api/tasks/${taskId}/complete`, {
        method: "PATCH",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to complete task");
      }

      setTasks((prev) =>
        prev.map((task) => (task.id === taskId ? data.task : task))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to complete task");
    } finally {
      setActionLoadingTaskId(null);
    }
  };

  const startEdit = (task: Task) => {
    setEditingTaskId(task.id);
    setEditingTitle(task.title);
    setEditingDescription(task.description || "");
    setEditingDueDate(
      task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : ""
    );
    setEditingCategory(task.category || "");
  };

  const cancelEdit = () => {
    setEditingTaskId(null);
    setEditingTitle("");
    setEditingDescription("");
    setEditingDueDate("");
    setEditingCategory("");
  };

  const saveEdit = async (taskId: string) => {
    setActionLoadingTaskId(taskId);
    setError("");

    try {
      const payload: TaskPayload = {
        title: editingTitle,
        description: editingDescription || null,
        dueDate: toIsoDateTime(editingDueDate),
        category: editingCategory || null,
      };

      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update task");
      }

      setTasks((prev) =>
        prev.map((task) => (task.id === taskId ? data.task : task))
      );
      cancelEdit();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update task");
    } finally {
      setActionLoadingTaskId(null);
    }
  };

  if (status === "loading") {
    return <div className="p-6 text-sm text-gray-200">Checking session...</div>;
  }

  if (!session?.user) {
    return (
      <div className="mx-auto mt-8 max-w-3xl rounded-xl border border-gray-700 bg-gray-900 p-6 text-white">
        <h1 className="text-2xl font-semibold">Task Manager</h1>
        <p className="mt-2 text-gray-300">Please sign in to manage your tasks.</p>
        <button
          onClick={() => signIn()}
          className="mt-4 rounded bg-blue-600 px-4 py-2 text-sm font-semibold hover:bg-blue-500"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl p-4 md:p-8 text-white">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="rounded-xl border border-gray-700 bg-gray-900 p-5 lg:col-span-1">
          <h2 className="text-xl font-semibold">Create Task</h2>
          <p className="mt-1 text-sm text-gray-300">Add title, description, due date, and category.</p>

          <div className="mt-4 space-y-3">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              className="w-full rounded border border-gray-600 bg-gray-800 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              className="min-h-24 w-full rounded border border-gray-600 bg-gray-800 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
            <input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded border border-gray-600 bg-gray-800 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Category (optional)"
              className="w-full rounded border border-gray-600 bg-gray-800 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />

            <button
              onClick={createTask}
              disabled={formLoading}
              className="w-full rounded bg-green-600 px-4 py-2 text-sm font-semibold hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {formLoading ? "Creating..." : "Create Task"}
            </button>
          </div>
        </section>

        <section className="rounded-xl border border-gray-700 bg-gray-900 p-5 lg:col-span-2">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">Your Tasks</h2>
            <div className="text-sm text-gray-300">
              Pending: {pendingCount} | Completed: {completedCount}
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded border border-red-700 bg-red-950 px-3 py-2 text-sm text-red-200">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-sm text-gray-300">Loading tasks...</div>
          ) : tasks.length === 0 ? (
            <div className="rounded border border-dashed border-gray-600 p-6 text-sm text-gray-300">
              No tasks yet. Create your first task from the form.
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => {
                const isEditing = editingTaskId === task.id;
                const isBusy = actionLoadingTaskId === task.id;

                return (
                  <article
                    key={task.id}
                    className="rounded-lg border border-gray-700 bg-gray-800/60 p-4"
                  >
                    {!isEditing ? (
                      <>
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <h3
                              className={`text-base font-semibold ${
                                task.completed ? "line-through text-gray-400" : ""
                              }`}
                            >
                              {task.title}
                            </h3>
                            <p className="mt-1 text-sm text-gray-300">
                              {task.description || "No description"}
                            </p>
                            <div className="mt-2 text-xs text-gray-400">
                              Due: {formatDateTime(task.dueDate)} | Category: {task.category || "-"}
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => markCompleted(task.id)}
                              disabled={isBusy || task.completed}
                              className="rounded bg-emerald-600 px-3 py-1 text-xs font-semibold hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {task.completed ? "Completed" : "Complete"}
                            </button>
                            <button
                              onClick={() => startEdit(task)}
                              disabled={isBusy}
                              className="rounded bg-amber-600 px-3 py-1 text-xs font-semibold hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteTask(task.id)}
                              disabled={isBusy}
                              className="rounded bg-red-700 px-3 py-1 text-xs font-semibold hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="space-y-2">
                        <input
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          className="w-full rounded border border-gray-600 bg-gray-900 px-3 py-2 text-sm outline-none focus:border-blue-500"
                        />
                        <textarea
                          value={editingDescription}
                          onChange={(e) => setEditingDescription(e.target.value)}
                          className="min-h-20 w-full rounded border border-gray-600 bg-gray-900 px-3 py-2 text-sm outline-none focus:border-blue-500"
                        />
                        <input
                          type="datetime-local"
                          value={editingDueDate}
                          onChange={(e) => setEditingDueDate(e.target.value)}
                          className="w-full rounded border border-gray-600 bg-gray-900 px-3 py-2 text-sm outline-none focus:border-blue-500"
                        />
                        <input
                          value={editingCategory}
                          onChange={(e) => setEditingCategory(e.target.value)}
                          className="w-full rounded border border-gray-600 bg-gray-900 px-3 py-2 text-sm outline-none focus:border-blue-500"
                        />

                        <div className="flex gap-2">
                          <button
                            onClick={() => saveEdit(task.id)}
                            disabled={isBusy}
                            className="rounded bg-blue-600 px-3 py-1 text-xs font-semibold hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isBusy ? "Saving..." : "Save"}
                          </button>
                          <button
                            onClick={cancelEdit}
                            disabled={isBusy}
                            className="rounded bg-gray-600 px-3 py-1 text-xs font-semibold hover:bg-gray-500 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}