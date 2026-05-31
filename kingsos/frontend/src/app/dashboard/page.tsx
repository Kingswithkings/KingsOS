"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api, setAuthToken } from "@/lib/api";

type Customer = {
  id: number;
  name: string;
  email?: string | null;
  company?: string | null;
  status?: string | null;
};

type Task = {
  id: number;
  title: string;
  priority?: string | null;
  status?: string | null;
  due_date?: string | null;
  assigned_to?: string | null;
};

type DashboardSummary = {
  total_customers: number;
  total_tasks: number;
  total_businesses: number;
  recent_activity: {
    recent_customers: Customer[];
    recent_tasks: Task[];
  };
  ai_insights: string[];
};

const emptySummary: DashboardSummary = {
  total_customers: 0,
  total_tasks: 0,
  total_businesses: 0,
  recent_activity: {
    recent_customers: [],
    recent_tasks: [],
  },
  ai_insights: [],
};

export default function DashboardPage() {
  const router = useRouter();
  const [summary, setSummary] = useState<DashboardSummary>(emptySummary);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token =
      localStorage.getItem("token") ??
      localStorage.getItem("kingsos_access_token");

    if (!token) {
      router.push("/login");
      return;
    }

    setAuthToken(token);

    async function loadDashboard() {
      try {
        const response = await api.get<DashboardSummary>("/dashboard/summary");
        setSummary(response.data);
      } catch {
        setError("Unable to load dashboard data.");
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboard();
  }, [router]);

  const stats = useMemo(
    () => [
      {
        label: "Customers",
        value: summary.total_customers,
        detail: "Tracked contacts",
      },
      {
        label: "Tasks",
        value: summary.total_tasks,
        detail: "Active workflow items",
      },
      {
        label: "Businesses",
        value: summary.total_businesses,
        detail: "Operating profiles",
      },
    ],
    [summary]
  );

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("kingsos_access_token");
    localStorage.removeItem("kingsos_user");
    setAuthToken("");
    router.push("/login");
  }

  return (
    <main className="min-h-screen bg-neutral-100 text-neutral-950">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-6 sm:px-8 lg:px-10">
        <header className="flex flex-col gap-4 border-b border-neutral-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-teal-700">KingsOS</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">
              Dashboard
            </h1>
          </div>

          <button
            className="h-10 rounded-md border border-neutral-300 bg-white px-4 text-sm font-medium text-neutral-800 transition hover:bg-neutral-50"
            type="button"
            onClick={handleLogout}
          >
            Log out
          </button>
        </header>

        {error ? (
          <p className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          {stats.map((stat) => (
            <div
              className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm"
              key={stat.label}
            >
              <p className="text-sm font-medium text-neutral-500">
                {stat.label}
              </p>
              <p className="mt-3 text-4xl font-semibold tracking-tight">
                {isLoading ? "..." : stat.value}
              </p>
              <p className="mt-2 text-sm text-neutral-500">{stat.detail}</p>
            </div>
          ))}
        </section>

        <section className="mt-6 grid flex-1 gap-6 lg:grid-cols-[1fr_0.85fr]">
          <div className="space-y-6">
            <section className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-lg font-semibold">Recent customers</h2>
                <a
                  className="text-sm font-medium text-teal-700"
                  href="/customers"
                >
                  View all
                </a>
              </div>

              <div className="mt-4 divide-y divide-neutral-100">
                {isLoading ? (
                  <p className="py-6 text-sm text-neutral-500">
                    Loading customers...
                  </p>
                ) : summary.recent_activity.recent_customers.length ? (
                  summary.recent_activity.recent_customers.map((customer) => (
                    <div className="py-4" key={customer.id}>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-medium">{customer.name}</p>
                          <p className="mt-1 text-sm text-neutral-500">
                            {customer.company || customer.email || "No details"}
                          </p>
                        </div>
                        <span className="rounded-md bg-teal-50 px-2 py-1 text-xs font-medium text-teal-700">
                          {customer.status || "lead"}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="py-6 text-sm text-neutral-500">
                    No customers yet.
                  </p>
                )}
              </div>
            </section>

            <section className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-lg font-semibold">Recent tasks</h2>
                <a className="text-sm font-medium text-teal-700" href="/tasks">
                  View all
                </a>
              </div>

              <div className="mt-4 divide-y divide-neutral-100">
                {isLoading ? (
                  <p className="py-6 text-sm text-neutral-500">
                    Loading tasks...
                  </p>
                ) : summary.recent_activity.recent_tasks.length ? (
                  summary.recent_activity.recent_tasks.map((task) => (
                    <div className="py-4" key={task.id}>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-medium">{task.title}</p>
                          <p className="mt-1 text-sm text-neutral-500">
                            {task.assigned_to || task.due_date || "Unassigned"}
                          </p>
                        </div>
                        <span className="rounded-md bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-700">
                          {task.status || task.priority || "pending"}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="py-6 text-sm text-neutral-500">
                    No tasks yet.
                  </p>
                )}
              </div>
            </section>
          </div>

          <aside className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">AI insights</h2>
            <div className="mt-4 space-y-3">
              {isLoading ? (
                <p className="text-sm text-neutral-500">Loading insights...</p>
              ) : summary.ai_insights.length ? (
                summary.ai_insights.map((insight) => (
                  <p
                    className="rounded-md bg-neutral-100 px-4 py-3 text-sm leading-6 text-neutral-700"
                    key={insight}
                  >
                    {insight}
                  </p>
                ))
              ) : (
                <p className="text-sm text-neutral-500">
                  No insights available.
                </p>
              )}
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
