"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getCookie } from "cookie-handler-pro";

type ToDoAppType = {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
};

const Page = () => {
  const [apps, setApps] = useState<ToDoAppType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = getCookie("token");

    if (!token) {
      setError("Token not found");
      setLoading(false);
      return;
    }

    const fetchApps = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/to-do-app`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch apps");

        const data: ToDoAppType[] = await res.json();
        setApps(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Unknown error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchApps();
  }, []);

  if (loading) return <div className="text-gray-500">Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Your ToDo Apps</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {apps.map((app) => (
          <Link
            key={app.id}
            href={`/dashboard/app/${app.id}`}
            className="block bg-white rounded-lg shadow p-4 hover:bg-gray-100">
            <h2 className="text-xl font-semibold">{app.name}</h2>
            <p className="text-gray-500">{app.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Page;
