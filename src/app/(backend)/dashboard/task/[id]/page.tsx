"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getCookie } from "cookie-handler-pro";

type ToDoAppType = {
  id: string;
  name: string;
  owner: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  created_at: string;
  updated_at: string;
};

const Page = () => {
  const params = useParams();
  const id = params.id as string;

  const [app, setApp] = useState<ToDoAppType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = getCookie("token");
    if (!token) {
      setError("Unauthorized");
      setLoading(false);
      return;
    }

    const fetchApp = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/to-do-app/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) throw new Error("App not found");

        const data: ToDoAppType = await res.json();
        setApp(data);
      } catch (err) {
        if (err instanceof Error) setError(err.message);
        else setError("Unknown error");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchApp();
  }, [id]);

  if (loading) return <div className="text-gray-500">Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!app) return <div className="text-gray-500">No App Data</div>;

  return (
    <div className="p-4 bg-white shadow rounded">
      <h1 className="text-2xl font-bold mb-2">{app.name}</h1>
      <p className="text-gray-600 text-sm mb-4">
        Created at: {new Date(app.created_at).toLocaleString()}
      </p>

      <div className="bg-gray-50 p-4 rounded shadow-inner">
        <h2 className="text-lg font-semibold mb-1">Owner Info:</h2>
        <p>
          <strong>Name:</strong> {app.owner.name}
        </p>
        <p>
          <strong>Email:</strong> {app.owner.email}
        </p>
        <p>
          <strong>Phone:</strong> {app.owner.phone}
        </p>
      </div>
    </div>
  );
};

export default Page;
