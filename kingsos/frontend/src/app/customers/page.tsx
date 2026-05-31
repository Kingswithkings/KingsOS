"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/AppLayout";
import { api, isUnauthorizedError, loadStoredAuthToken } from "@/lib/api";

type Customer = {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  status: string;
};

type CustomersResponse = {
  customers?: Customer[];
};

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [status, setStatus] = useState("lead");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadCustomers() {
      const token = loadStoredAuthToken();

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const response = await api.get<CustomersResponse>("/customers/");
        setCustomers(response.data.customers || []);
      } catch (error) {
        if (!isUnauthorizedError(error)) {
          console.error(error);
        }

        router.replace("/login");
      } finally {
        setLoading(false);
      }
    }

    loadCustomers();
  }, [router]);

  async function loadCustomers() {
    const response = await api.get<CustomersResponse>("/customers/");
    setCustomers(response.data.customers || []);
  }

  async function createCustomer(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    try {
      await api.post("/customers/create", null, {
        params: {
          name,
          email,
          phone,
          company,
          status,
          notes,
        },
      });

      setName("");
      setEmail("");
      setPhone("");
      setCompany("");
      setStatus("lead");
      setNotes("");
      setMessage("Customer created successfully.");

      loadCustomers();
    } catch (error) {
      console.error(error);
      setMessage("Failed to create customer.");
    }
  }

  return (
    <AppLayout>
      <h1 className="text-3xl font-bold mb-6">Customers</h1>

      <form onSubmit={createCustomer} className="bg-white p-6 rounded-xl shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Add New Customer</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input className="border p-3 rounded" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />

          <input className="border p-3 rounded" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />

          <input className="border p-3 rounded" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />

          <input className="border p-3 rounded" placeholder="Company" value={company} onChange={(e) => setCompany(e.target.value)} />

          <select className="border p-3 rounded" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="lead">Lead</option>
            <option value="prospect">Prospect</option>
            <option value="customer">Customer</option>
            <option value="inactive">Inactive</option>
          </select>

          <input className="border p-3 rounded" placeholder="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>

        <button className="mt-4 bg-black text-white px-6 py-3 rounded">
          Save Customer
        </button>

        {message && <p className="mt-4 text-sm text-gray-700">{message}</p>}
      </form>

      {loading ? (
        <p>Loading customers...</p>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="p-4 text-left">Name</th>
                <th className="p-4 text-left">Email</th>
                <th className="p-4 text-left">Phone</th>
                <th className="p-4 text-left">Company</th>
                <th className="p-4 text-left">Status</th>
              </tr>
            </thead>

            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id} className="border-b">
                  <td className="p-4">{customer.name}</td>
                  <td className="p-4">{customer.email}</td>
                  <td className="p-4">{customer.phone}</td>
                  <td className="p-4">{customer.company}</td>
                  <td className="p-4">{customer.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppLayout>
  );
}
