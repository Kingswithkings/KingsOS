"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import AppLayout from "@/components/AppLayout";
import { api, isUnauthorizedError, loadStoredAuthToken } from "@/lib/api";

type Project = {
  id: number;
  name: string;
  description: string | null;
  owner: string | null;
  status: string;
};

type ProjectTask = {
  id: number;
  title: string;
  status: string;
};

type ProjectTasksResponse = {
  project: Project;
  progress: number;
  tasks: ProjectTask[];
};

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [taskSummary, setTaskSummary] = useState<ProjectTasksResponse | null>(
    null
  );

  useEffect(() => {
    async function loadProject() {
      const token = loadStoredAuthToken();

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const summaryResponse = await api.get<ProjectTasksResponse>(
          `/projects/${params.id}/summary`
        );

        setProject(summaryResponse.data.project);
        setTaskSummary(summaryResponse.data);
      } catch (error) {
        if (isUnauthorizedError(error)) {
          router.replace("/login");
          return;
        }

        console.error(error);
        router.replace("/projects");
      }
    }

    loadProject();
  }, [params.id, router]);

  if (!project || !taskSummary) {
    return (
      <AppLayout>
        <p>Loading project...</p>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mb-6">
        <Link className="text-sm font-medium underline" href="/projects">
          Back to Projects
        </Link>
      </div>

      <section className="max-w-3xl rounded-xl bg-white p-6 shadow">
        <h1 className="text-3xl font-bold">{project.name}</h1>

        <p className="mt-6 text-xl font-semibold">
          Progress: {Math.round(taskSummary.progress)}%
        </p>

        <div className="mt-3 h-3 overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-green-500"
            style={{ width: `${taskSummary.progress}%` }}
          />
        </div>

        <h2 className="mt-8 text-xl font-semibold">Tasks:</h2>

        {taskSummary.tasks.length === 0 ? (
          <p className="mt-4 text-gray-500">No tasks assigned to this project.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {taskSummary.tasks.map((task) => (
              <p className="text-lg font-medium" key={task.id}>
                <span className="mr-2">
                  {task.status === "completed" ? "✓" : "⏳"}
                </span>
                {task.title}
              </p>
            ))}
          </div>
        )}
      </section>
    </AppLayout>
  );
}
