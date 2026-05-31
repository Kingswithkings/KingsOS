"use client";

import { useRouter } from "next/navigation";
import { clearStoredAuth } from "@/lib/api";

export default function LogoutButton() {
  const router = useRouter();

  function logout() {
    clearStoredAuth();
    router.replace("/login");
  }

  return (
    <button
      type="button"
      onClick={logout}
      className="mt-10 text-left text-red-300 hover:text-red-100"
    >
      Logout
    </button>
  );
}
