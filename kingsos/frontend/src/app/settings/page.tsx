"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/AppLayout";
import { api, isUnauthorizedError, loadStoredAuthToken } from "@/lib/api";

type CurrentUser = {
  full_name: string;
  business_name: string;
  business_type: string;
  email: string;
};

export default function SettingsPage() {
  const router = useRouter();
  const [me, setMe] = useState<CurrentUser | null>(null);

  useEffect(() => {
    async function loadUser() {
      const token = loadStoredAuthToken();

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const response = await api.get<CurrentUser>("/auth/me");
        setMe(response.data);
      } catch (error) {
        if (!isUnauthorizedError(error)) {
          console.error(error);
        }

        router.replace("/login");
      }
    }

    loadUser();
  }, [router]);

  return (
    <AppLayout>
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      <div className="bg-white p-6 rounded-xl shadow max-w-2xl">
        <h2 className="text-xl font-semibold mb-4">Profile</h2>

        {!me ? (
          <p>Loading profile...</p>
        ) : (
          <div className="space-y-4">
            <Info label="Full Name" value={me.full_name} />
            <Info label="Business Name" value={me.business_name} />
            <Info label="Business Type" value={me.business_type} />
            <Info label="Email" value={me.email} />
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}
