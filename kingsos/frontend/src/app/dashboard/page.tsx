"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/AppLayout";
import { api, isUnauthorizedError, loadStoredAuthToken } from "@/lib/api";

type DashboardCustomer = {
  id: number;
  name: string;
  company: string;
  status: string;
};

type DashboardTask = {
  id: number;
  title: string;
  priority: string;
  status: string;
};

type DashboardSummary = {
  total_businesses: number;
  total_customers: number;
  total_tasks: number;
  pending_tasks: number;
  completed_tasks: number;
  recent_activity?: {
    recent_customers?: DashboardCustomer[];
    recent_tasks?: DashboardTask[];
  };
  ai_insights?: string[];
};

type CurrentUser = {
  full_name: string;
  business_name: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [me, setMe] = useState<CurrentUser | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      const token = loadStoredAuthToken();

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const userRes = await api.get<CurrentUser>("/auth/me");
        const summaryRes = await api.get<DashboardSummary>(
          "/dashboard/summary"
        );

        setMe(userRes.data);
        setSummary(summaryRes.data);
      } catch (error) {
        if (!isUnauthorizedError(error)) {
          console.error(error);
        }

        router.replace("/login");
      }
    }

    loadDashboard();
  }, [router]);

  if (!summary) {
    return (
      <AppLayout>
        <p>Loading KingsOS dashboard...</p>
      </AppLayout>
    );
  }

  const recentCustomers = summary.recent_activity?.recent_customers || [];
  const recentTasks = summary.recent_activity?.recent_tasks || [];

  return (
    <AppLayout>
      <h1 className="text-3xl font-bold mb-2">Dashboard</h1>

      <p className="text-gray-600 mb-8">
        Welcome, {me?.full_name} {me?.business_name}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
        <Card title="Businesses" value={summary.total_businesses} />
        <Card title="Customers" value={summary.total_customers} />
        <Card title="Tasks" value={summary.total_tasks} />
        <Card title="Pending" value={summary.pending_tasks} />
        <Card title="Completed" value={summary.completed_tasks} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <section className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">Recent Customers</h2>

          {recentCustomers.length === 0 ? (
            <p className="text-gray-500">No recent customers yet.</p>
          ) : (
            recentCustomers.map((customer) => (
              <div key={customer.id} className="border-b py-3">
                <p className="font-semibold">{customer.name}</p>
                <p className="text-sm text-gray-500">
                  {customer.company} — {customer.status}
                </p>
              </div>
            ))
          )}
        </section>

        <section className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">Recent Tasks</h2>

          {recentTasks.length === 0 ? (
            <p className="text-gray-500">No recent tasks yet.</p>
          ) : (
            recentTasks.map((task) => (
              <div key={task.id} className="border-b py-3">
                <p className="font-semibold">{task.title}</p>
                <p className="text-sm text-gray-500">
                  {task.priority} priority — {task.status}
                </p>
              </div>
            ))
          )}
        </section>
      </div>

      <section className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4">AI Insights</h2>

        {summary.ai_insights?.map((item: string, index: number) => (
          <p key={index} className="text-gray-700 mb-2">
            • {item}
          </p>
        ))}
      </section>
    </AppLayout>
  );
}

function Card({ title, value }: { title: string; value: number }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <p className="text-gray-500">{title}</p>
      <h2 className="text-4xl font-bold">{value}</h2>
    </div>
  );
}
