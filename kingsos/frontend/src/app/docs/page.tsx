import AppLayout from "@/components/AppLayout";

const sections = [
  {
    title: "Dashboard",
    description:
      "View customer totals, task totals, business profiles, recent activity, and AI insights.",
  },
  {
    title: "Customers",
    description:
      "Track contacts, companies, lead status, and the details needed to manage relationships.",
  },
  {
    title: "Tasks",
    description:
      "Organize work by status, priority, due date, and owner so daily operations stay visible.",
  },
  {
    title: "AI Assistant",
    description:
      "Use assistant workflows for summaries, operational guidance, and business support.",
  },
];

export default function DocsPage() {
  return (
    <AppLayout>
      <div className="mx-auto w-full max-w-5xl text-neutral-950">
        <header className="border-b border-neutral-200 pb-6">
          <p className="text-sm font-medium text-teal-700">KingsOS</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Docs</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600">
            Quick reference for the main KingsOS areas and how they fit
            together.
          </p>
        </header>

        <section className="mt-6 grid gap-4 md:grid-cols-2">
          {sections.map((section) => (
            <article
              className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm"
              key={section.title}
            >
              <h2 className="text-lg font-semibold">{section.title}</h2>
              <p className="mt-2 text-sm leading-6 text-neutral-600">
                {section.description}
              </p>
            </article>
          ))}
        </section>
      </div>
    </AppLayout>
  );
}
