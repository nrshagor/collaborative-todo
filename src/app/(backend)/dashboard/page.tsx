"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getCookie } from "cookie-handler-pro";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@heroui/react";

type ToDoAppType = {
  id: string;
  name: string;
  owner?: {
    name: string;
  };

  created_at: string;
};

const Page = () => {
  const [apps, setApps] = useState<ToDoAppType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [newAppName, setNewAppName] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");

  const handleCreateApp = async () => {
    const token = getCookie("token");
    if (!token) {
      setCreateError("Token not found");
      return;
    }

    if (!newAppName.trim()) {
      setCreateError("App name is required");
      return;
    }

    setCreateLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/to-do-app`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newAppName }),
      });

      if (!res.ok) throw new Error("Failed to create app");

      const refetch = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/to-do-app`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const allApps: ToDoAppType[] = await refetch.json();
      setApps(allApps);

      onClose();
      setNewAppName("");
      setCreateError("");
    } catch (err) {
      if (err instanceof Error) {
        setCreateError(err.message);
      } else {
        setCreateError("Something went wrong");
      }
    } finally {
      setCreateLoading(false);
    }
  };

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
      <h1 className="text-2xl font-bold mb-4 text-black dark:text-white">
        Your ToDo Apps
      </h1>
      <div className="flex flex-wrap gap-3">
        <Button onPress={onOpen}>Create Todo App</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {apps.map((app) => (
          <Link
            key={app.id}
            href={`/dashboard/todo/${app.id}`}
            className="block bg-white rounded-lg shadow p-4 hover:bg-gray-100 text-black dark:text-white">
            <h2 className="text-xl font-semibold text-black dark:text-white">
              {app.name}
            </h2>
            <p className="text-gray-500">
              Owner: {app.owner?.name ?? "Unknown"}
            </p>
            <p className="text-xs text-gray-400">
              Created At: {new Date(app?.created_at).toLocaleString()}
            </p>
          </Link>
        ))}
      </div>

      <Modal isOpen={isOpen} size={"lg"} onClose={onClose}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Create ToDo App
              </ModalHeader>
              <ModalBody>
                <Input
                  label="App Name"
                  value={newAppName}
                  onChange={(e) => setNewAppName(e.target.value)}
                  placeholder="Enter your app name"
                  className="mb-2"
                />
                {createError && (
                  <p className="text-red-600 text-sm">{createError}</p>
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={handleCreateApp}
                  isLoading={createLoading}>
                  Create
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default Page;
