"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/AppLayout";
import { api, isUnauthorizedError, loadStoredAuthToken } from "@/lib/api";

type Project = {
  id: number;
  name: string;
  description: string | null;
  owner: string | null;
  status: string;
};

type ProjectsResponse = {
  projects?: Project[];
};

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [owner, setOwner] = useState("");
  const [status, setStatus] = useState("active");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadInitialProjects() {
      const token = loadStoredAuthToken();

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        await loadProjects();
      } catch (error) {
        if (!isUnauthorizedError(error)) {
          console.error(error);
        }

        router.replace("/login");
      }
    }

    loadInitialProjects();
  }, [router]);

  async function loadProjects() {
    const response = await api.get<ProjectsResponse>("/projects/");
    setProjects(response.data.projects || []);
  }

  async function createProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    try {
      await api.post("/projects/create", {
        name,
        description,
        owner,
        status,
      });

      setName("");
      setDescription("");
      setOwner("");
      setStatus("active");
      setMessage("Project created successfully.");

      loadProjects();
    } catch (error) {
      console.error(error);
      setMessage("Failed to create project.");
    }
  }

  return (
    <AppLayout>
      <h1 className="text-3xl font-bold mb-6">Projects</h1>

      <form
        onSubmit={createProject}
        className="bg-white p-6 rounded-xl shadow mb-8"
      >
        <h2 className="text-xl font-semibold mb-4">Create Project</h2>

        <input
          className="w-full border p-3 rounded mb-3"
          placeholder="Project Name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />

        <input
          className="w-full border p-3 rounded mb-3"
          placeholder="Description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />

        <input
          className="w-full border p-3 rounded mb-3"
          placeholder="Owner"
          value={owner}
          onChange={(event) => setOwner(event.target.value)}
        />

        <select
          className="w-full border p-3 rounded mb-3"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="completed">Completed</option>
        </select>

        <button className="bg-black text-white px-6 py-3 rounded" type="submit">
          Create Project
        </button>

        {message ? <p className="mt-4 text-sm text-gray-700">{message}</p> : null}
      </form>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="p-4 text-left">Project</th>
              <th className="p-4 text-left">Description</th>
              <th className="p-4 text-left">Owner</th>
              <th className="p-4 text-left">Status</th>
            </tr>
          </thead>

          <tbody>
            {projects.map((project) => (
              <tr key={project.id} className="border-b">
                <td className="p-4">
                  <Link
                    className="font-medium underline"
                    href={`/projects/${project.id}`}
                  >
                    {project.name}
                  </Link>
                </td>
                <td className="p-4">{project.description}</td>
                <td className="p-4">{project.owner}</td>
                <td className="p-4">{project.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppLayout>
  );
}
