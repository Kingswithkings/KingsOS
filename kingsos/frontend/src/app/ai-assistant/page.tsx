"use client";

import { FormEvent, useState } from "react";
import AppLayout from "@/components/AppLayout";
import { api, isUnauthorizedError, loadStoredAuthToken } from "@/lib/api";

export default function AIAssistantPage() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  async function askAI(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    loadStoredAuthToken();

    setLoading(true);
    setAnswer("");

    try {
      const response = await api.post<{ answer: string }>("/ai/ask", null, {
        params: {
          question,
        },
      });

      setAnswer(response.data.answer);
    } catch (error) {
      if (!isUnauthorizedError(error)) {
        console.error(error);
      }

      setAnswer("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppLayout>
      <h1 className="mb-2 text-3xl font-bold">AI Assistant</h1>
      <p className="mb-8 text-gray-600">
        Ask KingsOS about your business, customers, tasks, and operations.
      </p>

      <form className="mb-6 rounded-xl bg-white p-6 shadow" onSubmit={askAI}>
        <textarea
          className="mb-4 w-full rounded border border-gray-300 p-4 text-gray-900 placeholder:text-gray-600 focus:border-black focus:outline-none"
          rows={5}
          placeholder="What can you help me with today?"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
        />

        <button
          className="rounded bg-black px-6 py-3 text-white disabled:bg-neutral-400"
          type="submit"
          disabled={loading}
        >
          {loading ? "Thinking..." : "Ask AI"}
        </button>
      </form>

      {answer ? (
        <div className="rounded-xl bg-white p-6 shadow">
          <h2 className="mb-3 text-xl font-semibold">KingsOS Response</h2>
          <p className="text-gray-700">{answer}</p>
        </div>
      ) : null}
    </AppLayout>
  );
}
