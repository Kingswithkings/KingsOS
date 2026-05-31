"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/AppLayout";
import { api, isUnauthorizedError, loadStoredAuthToken } from "@/lib/api";

type Task = {
  id: number;
  title: string;
  priority: string;
  status: string;
  due_date: string | null;
  assigned_to: string | null;
  assigned_user_id: number | null;
  project_id: number | null;
};

type TasksResponse = {
  tasks?: Task[];
};

type Project = {
  id: number;
  name: string;
};

type ProjectsResponse = {
  projects?: Project[];
};

type TeamMember = {
  id: number;
  full_name: string;
};

type TeamResponse = {
  members?: TeamMember[];
};

export default function TasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [status, setStatus] = useState("pending");
  const [dueDate, setDueDate] = useState("");
  const [selectedAssignee, setSelectedAssignee] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadTasks() {
      const token = loadStoredAuthToken();

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const [tasksResponse, projectsResponse, teamResponse] = await Promise.all([
          api.get<TasksResponse>("/tasks/"),
          api.get<ProjectsResponse>("/projects/"),
          api.get<TeamResponse>("/team/"),
        ]);

        setTasks(tasksResponse.data.tasks || []);
        setProjects(projectsResponse.data.projects || []);
        setTeamMembers(teamResponse.data.members || []);
      } catch (error) {
        if (!isUnauthorizedError(error)) {
          console.error(error);
        }

        router.replace("/login");
      } finally {
        setLoading(false);
      }
    }

    loadTasks();
  }, [router]);

  async function loadTasks() {
    const response = await api.get<TasksResponse>("/tasks/");
    setTasks(response.data.tasks || []);
  }

  async function createTask(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    const assignedMember = teamMembers.find(
      (member) => member.id === Number(selectedAssignee)
    );

    try {
      await api.post("/tasks/create", null, {
        params: {
          title,
          description,
          priority,
          status,
          due_date: dueDate,
          assigned_to: assignedMember?.full_name,
          assigned_user_id: selectedAssignee || undefined,
          project_id: selectedProject || undefined,
        },
      });

      setTitle("");
      setDescription("");
      setPriority("medium");
      setStatus("pending");
      setDueDate("");
      setSelectedAssignee("");
      setSelectedProject("");
      setMessage("Task created successfully.");

      loadTasks();
    } catch (error) {
      console.error(error);
      setMessage("Failed to create task.");
    }
  }

  async function updateTaskStatus(taskId: number, newStatus: string) {
    try {
      await api.put(`/tasks/${taskId}`, null, {
        params: {
          status: newStatus,
        },
      });

      loadTasks();
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <AppLayout>
      <h1 className="text-3xl font-bold mb-6">Tasks</h1>

      <form onSubmit={createTask} className="bg-white p-6 rounded-xl shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Add New Task</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input className="border p-3 rounded" placeholder="Task title" value={title} onChange={(e) => setTitle(e.target.value)} required />

          <select className="border p-3 rounded" value={selectedAssignee} onChange={(e) => setSelectedAssignee(e.target.value)}>
            <option value="">Assigned To</option>
            {teamMembers.map((member) => (
              <option key={member.id} value={member.id}>
                {member.full_name}
              </option>
            ))}
          </select>

          <select className="border p-3 rounded" value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)}>
            <option value="">Select Project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>

          <select className="border p-3 rounded" value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          <select className="border p-3 rounded" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>

          <input className="border p-3 rounded" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />

          <input className="border p-3 rounded" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        <button className="mt-4 bg-black text-white px-6 py-3 rounded">
          Save Task
        </button>

        {message && <p className="mt-4 text-sm text-gray-700">{message}</p>}
      </form>

      {loading ? (
        <p>Loading tasks...</p>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="p-4 text-left">Title</th>
                <th className="p-4 text-left">Priority</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Due Date</th>
                <th className="p-4 text-left">Assigned To</th>
                <th className="p-4 text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {tasks.map((task) => (
                <tr key={task.id} className="border-b">
                  <td className="p-4">{task.title}</td>
                  <td className="p-4">{task.priority}</td>
                  <td className="p-4">{task.status}</td>
                  <td className="p-4">{task.due_date}</td>
                  <td className="p-4">{task.assigned_to}</td>
                  <td className="p-4 space-x-2">
                    <button
                      onClick={() => updateTaskStatus(task.id, "pending")}
                      className="text-xs bg-gray-200 px-3 py-1 rounded"
                      type="button"
                    >
                      Pending
                    </button>

                    <button
                      onClick={() => updateTaskStatus(task.id, "in_progress")}
                      className="text-xs bg-yellow-200 px-3 py-1 rounded"
                      type="button"
                    >
                      In Progress
                    </button>

                    <button
                      onClick={() => updateTaskStatus(task.id, "completed")}
                      className="text-xs bg-green-200 px-3 py-1 rounded"
                      type="button"
                    >
                      Done
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppLayout>
  );
}
