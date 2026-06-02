"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/AppLayout";
import { api, isUnauthorizedError, loadStoredAuthToken } from "@/lib/api";

type Activity = {
  id: number;
  action: string;
  entity_type: string;
  entity_id: number;
  user: string;
  timestamp: string;
};

type ActivityResponse = {
  activities?: Activity[];
};

export default function ActivityPage() {
  const router = useRouter();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadActivity() {
      const token = loadStoredAuthToken();

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const response = await api.get<ActivityResponse>("/activity/");
        setActivities(response.data.activities || []);
      } catch (error) {
        if (isUnauthorizedError(error)) {
          router.replace("/login");
          return;
        }

        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadActivity();
  }, [router]);

  return (
    <AppLayout>
      <h1 className="mb-6 text-3xl font-bold">Activity</h1>

      {loading ? (
        <p>Loading activity...</p>
      ) : (
        <div className="overflow-hidden rounded-xl bg-white shadow">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="p-4 text-left">Action</th>
                <th className="p-4 text-left">Entity</th>
                <th className="p-4 text-left">User</th>
                <th className="p-4 text-left">Timestamp</th>
              </tr>
            </thead>

            <tbody>
              {activities.map((activity) => (
                <tr className="border-b" key={activity.id}>
                  <td className="p-4">{activity.action}</td>
                  <td className="p-4">
                    {activity.entity_type} #{activity.entity_id}
                  </td>
                  <td className="p-4">{activity.user}</td>
                  <td className="p-4">{activity.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppLayout>
  );
}
