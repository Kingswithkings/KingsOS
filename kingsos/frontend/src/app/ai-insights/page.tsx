"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/AppLayout";
import { api, isUnauthorizedError, loadStoredAuthToken } from "@/lib/api";

type BusinessAnalysis = {
  health_score: number;
  total_customers: number;
  total_projects: number;
  total_tasks: number;
  pending_tasks: number;
  completed_tasks: number;
  recommendations: string[];
};

export default function AIInsightsPage() {
  const router = useRouter();
  const [data, setData] = useState<BusinessAnalysis | null>(null);

  useEffect(() => {
    async function loadAnalysis() {
      const token = loadStoredAuthToken();

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const response = await api.get<BusinessAnalysis>(
          "/ai/business-analysis"
        );

        setData(response.data);
      } catch (error) {
        if (isUnauthorizedError(error)) {
          router.replace("/login");
          return;
        }

        console.error(error);
      }
    }

    loadAnalysis();
  }, [router]);

  if (!data) {
    return (
      <AppLayout>
        <p>Loading AI Analysis...</p>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <h1 className="text-3xl font-bold mb-6">AI Insights</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card title="Health Score" value={`${data.health_score}%`} />
        <Card title="Customers" value={data.total_customers} />
        <Card title="Projects" value={data.total_projects} />
      </div>

      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4">Recommendations</h2>

        {data.recommendations.map((item, index) => (
          <p key={index}>• {item}</p>
        ))}
      </div>
    </AppLayout>
  );
}

function Card({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) {
  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <p className="text-gray-500">{title}</p>

      <h2 className="text-4xl font-bold">{value}</h2>
    </div>
  );
}
