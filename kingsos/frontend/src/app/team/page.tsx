"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/AppLayout";
import { api, isUnauthorizedError, loadStoredAuthToken } from "@/lib/api";

type TeamMember = {
  id: number;
  full_name: string;
  email: string;
  role: string;
  status: string;
};

type TeamResponse = {
  members?: TeamMember[];
};

export default function TeamPage() {
  const router = useRouter();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadInitialTeam() {
      const token = loadStoredAuthToken();

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        await loadTeam();
      } catch (error) {
        if (!isUnauthorizedError(error)) {
          console.error(error);
        }

        router.replace("/login");
      }
    }

    loadInitialTeam();
  }, [router]);

  async function loadTeam() {
    const response = await api.get<TeamResponse>("/team/");
    setMembers(response.data.members || []);
  }

  async function createMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    try {
      await api.post("/team/create", null, {
        params: {
          full_name: fullName,
          email,
          role,
        },
      });

      setFullName("");
      setEmail("");
      setRole("");
      setMessage("Team member added.");
      loadTeam();
    } catch (error) {
      console.error(error);
      setMessage("Failed to add team member.");
    }
  }

  return (
    <AppLayout>
      <h1 className="text-3xl font-bold mb-6">Team Members</h1>

      <form
        onSubmit={createMember}
        className="bg-white p-6 rounded-xl shadow mb-8"
      >
        <h2 className="text-xl font-semibold mb-4">Add Team Member</h2>

        <input
          className="w-full border border-gray-300 p-3 rounded mb-3 text-gray-900 placeholder:text-gray-600"
          placeholder="Full Name"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          required
        />

        <input
          className="w-full border border-gray-300 p-3 rounded mb-3 text-gray-900 placeholder:text-gray-600"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <input
          className="w-full border border-gray-300 p-3 rounded mb-3 text-gray-900 placeholder:text-gray-600"
          placeholder="Role"
          value={role}
          onChange={(event) => setRole(event.target.value)}
          required
        />

        <button className="bg-black text-white px-6 py-3 rounded">
          Add Member
        </button>

        {message ? <p className="mt-4 text-sm text-gray-700">{message}</p> : null}
      </form>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left">Email</th>
              <th className="p-4 text-left">Role</th>
              <th className="p-4 text-left">Status</th>
            </tr>
          </thead>

          <tbody>
            {members.map((member) => (
              <tr key={member.id} className="border-b">
                <td className="p-4">{member.full_name}</td>
                <td className="p-4">{member.email}</td>
                <td className="p-4">{member.role}</td>
                <td className="p-4">{member.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppLayout>
  );
}
