import Link from "next/link";
import LogoutButton from "./LogoutButton";

export default function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-black text-white p-6">
      <h1 className="text-2xl font-bold mb-2">KingsOS</h1>
      <p className="text-sm text-gray-400 mb-10">
        AI Business Operating System
      </p>

      <nav className="space-y-4">
        <Link href="/dashboard" className="block hover:text-gray-300">
          🏠 Dashboard
        </Link>

        <Link href="/customers" className="block hover:text-gray-300">
          👥 Customers
        </Link>

        <Link href="/tasks" className="block hover:text-gray-300">
          ✅ Tasks
        </Link>

        <Link href="/projects" className="block hover:text-gray-300">
          📁 Projects
        </Link>

        <Link href="/team" className="block hover:text-gray-300">
          👤 Team
        </Link>

        <Link href="/ai-assistant" className="block hover:text-gray-300">
          🤖 AI Assistant
        </Link>

        <Link href="/settings" className="block hover:text-gray-300">
          ⚙️ Settings
        </Link>

        <LogoutButton />
      </nav>
    </aside>
  );
}
