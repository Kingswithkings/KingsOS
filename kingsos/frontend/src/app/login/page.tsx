"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/api";

type LoginResponse = {
  access_token: string;
  user: {
    full_name: string;
    business_name: string;
    email: string;
  };
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.detail ?? "Unable to sign in.");
      }

      const data = (await response.json()) as LoginResponse;
      localStorage.setItem("kingsos_access_token", data.access_token);
      localStorage.setItem("kingsos_user", JSON.stringify(data.user));

      router.replace("/dashboard");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to sign in."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <section className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <div className="flex min-h-[36rem] flex-col justify-between bg-[linear-gradient(135deg,#151515_0%,#1f2937_48%,#0f766e_100%)] px-6 py-8 sm:px-10 lg:px-14">
          <div className="text-xl font-semibold tracking-tight">KingsOS</div>

          <div className="max-w-xl pb-8">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-teal-100">
              Business Operating System
            </p>
            <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              Sign in to run the day from one place.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-neutral-200">
              Manage customers, tasks, dashboard insights, and AI workflows with
              your KingsOS account.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center bg-white px-6 py-12 text-neutral-950 sm:px-10">
          <div className="w-full max-w-md">
            <div>
              <p className="text-sm font-medium text-teal-700">Welcome back</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                Log in
              </h2>
            </div>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              <div>
                <label
                  className="text-sm font-medium text-neutral-700"
                  htmlFor="email"
                >
                  Email
                </label>
                <input
                  className="mt-2 h-12 w-full rounded-md border border-neutral-300 bg-white px-4 text-base text-neutral-950 outline-none transition focus:border-teal-700 focus:ring-4 focus:ring-teal-700/10"
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>

              <div>
                <label
                  className="text-sm font-medium text-neutral-700"
                  htmlFor="password"
                >
                  Password
                </label>
                <input
                  className="mt-2 h-12 w-full rounded-md border border-neutral-300 bg-white px-4 text-base text-neutral-950 outline-none transition focus:border-teal-700 focus:ring-4 focus:ring-teal-700/10"
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  minLength={8}
                  required
                />
              </div>

              {error ? (
                <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </p>
              ) : null}

              <button
                className="flex h-12 w-full items-center justify-center rounded-md bg-neutral-950 px-4 text-base font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-400"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Signing in..." : "Sign in"}
              </button>
            </form>

            <p className="text-center mt-4 text-sm text-neutral-600">
              No account?{" "}
              <Link href="/register" className="underline">
                Create Workspace
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
