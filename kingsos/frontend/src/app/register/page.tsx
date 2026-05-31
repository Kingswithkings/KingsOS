"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function register(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsSubmitting(true);

    try {
      await api.post("/auth/register", {
        full_name: fullName,
        business_name: businessName,
        business_type: businessType,
        email,
        password,
      });

      setMessage("Business registered successfully.");

      window.setTimeout(() => {
        router.replace("/login");
      }, 1500);
    } catch (error) {
      console.error(error);
      setMessage("Registration failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 px-6 py-12">
      <form
        onSubmit={register}
        className="bg-white p-8 rounded-xl shadow-md w-full max-w-lg text-gray-900"
      >
        <h1 className="text-3xl font-bold mb-2">Register Business</h1>

        <p className="text-gray-500 mb-6">Create your KingsOS workspace.</p>

        <input
          className="w-full border border-gray-300 p-3 rounded mb-4 text-gray-900 placeholder:text-gray-600"
          placeholder="Full Name"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          required
        />

        <input
          className="w-full border border-gray-300 p-3 rounded mb-4 text-gray-900 placeholder:text-gray-600"
          placeholder="Business Name"
          value={businessName}
          onChange={(event) => setBusinessName(event.target.value)}
          required
        />

        <input
          className="w-full border border-gray-300 p-3 rounded mb-4 text-gray-900 placeholder:text-gray-600"
          placeholder="Business Type"
          value={businessType}
          onChange={(event) => setBusinessType(event.target.value)}
          required
        />

        <input
          className="w-full border border-gray-300 p-3 rounded mb-4 text-gray-900 placeholder:text-gray-600"
          placeholder="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <input
          type="password"
          className="w-full border border-gray-300 p-3 rounded mb-4 text-gray-900 placeholder:text-gray-600"
          placeholder="Password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          minLength={8}
          required
        />

        <button
          className="w-full bg-black text-white p-3 rounded disabled:bg-neutral-400"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating Workspace..." : "Create Workspace"}
        </button>

        {message ? (
          <p className="mt-4 text-center text-gray-700">{message}</p>
        ) : null}
      </form>
    </main>
  );
}
