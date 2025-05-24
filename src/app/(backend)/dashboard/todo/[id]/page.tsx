"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getCookie } from "cookie-handler-pro";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Textarea,
  useDisclosure,
} from "@heroui/react";

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

type Task = {
  id: string;
  title: string;
  description: string;
  status: "in-progress" | "stale" | "completed";
  due_date: string;
  priority: number;
};

const statusMapping = {
  "in-progress": "in-progress",
  stale: "stale",
  done: "completed",
} as const;

const displayStatusMapping: Record<
  Task["status"],
  "in-progress" | "stale" | "done"
> = {
  "in-progress": "in-progress",
  stale: "stale",
  completed: "done",
};

const Page = () => {
  const { id } = useParams();
  const [app, setApp] = useState<ToDoAppType | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [taskLoading, setTaskLoading] = useState(false);
  const [error, setError] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [token, setToken] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    due_date: "",
    priority: 1,
    status: "in-progress" as "in-progress" | "stale" | "done",
  });

  useEffect(() => {
    const token = getCookie("token");
    setToken(token);

    if (!token) {
      setError("Unauthorized");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const [appRes, tasksRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/to-do-app/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks?appId=${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }),
        ]);

        if (!appRes.ok) throw new Error("App not found");
        if (!tasksRes.ok) throw new Error("Failed to fetch tasks");

        const [appData, tasksData] = await Promise.all([
          appRes.json() as Promise<ToDoAppType>,
          tasksRes.json() as Promise<Task[]>,
        ]);

        setApp(appData);
        setTasks(tasksData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  const handleTaskCreate = async () => {
    if (!token) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          appId: id,
          ...form,
          status: statusMapping[form.status],
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create task");
      }

      const newTask: Task = await res.json();
      setTasks((prev) => [...prev, newTask]);
      resetForm();
      onClose();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Unknown error");
    }
  };

  const updateStatus = async (
    taskId: string,
    newStatus: keyof typeof statusMapping
  ) => {
    if (!token) return;

    try {
      setTaskLoading(true);
      const backendStatus = statusMapping[newStatus];

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/tasks/${taskId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: backendStatus }),
        }
      );

      if (!res.ok) throw new Error("Failed to update status");

      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId ? { ...task, status: backendStatus } : task
        )
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setTaskLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      due_date: "",
      priority: 1,
      status: "in-progress",
    });
  };

  const getDisplayStatus = (status: Task["status"]) => {
    return displayStatusMapping[status];
  };

  if (loading) return <div className="text-gray-500">Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!app) return <div className="text-gray-500">No App Data</div>;

  return (
    <div className="p-4 space-y-6">
      <div className="bg-white shadow p-4 rounded">
        <h1 className="text-2xl font-bold mb-2">{app.name}</h1>
        <p className="text-gray-600 text-sm mb-4">
          Created: {new Date(app.created_at).toLocaleString()}
        </p>
        <div className="bg-gray-50 p-4 rounded">
          <h2 className="text-lg font-semibold mb-1">Owner</h2>
          <p>Name: {app.owner.name}</p>
          <p>Email: {app.owner.email}</p>
          <p>Phone: {app.owner.phone}</p>
        </div>
      </div>

      <div className="bg-white shadow p-4 rounded">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Tasks</h2>
          <Button onPress={onOpen}>Create Task</Button>
        </div>

        <div className="grid gap-3">
          {tasks.length === 0 ? (
            <p className="text-gray-500">No tasks found</p>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className="border p-3 rounded shadow-sm bg-gray-50">
                <h3 className="font-semibold">{task.title}</h3>
                <p className="text-sm text-gray-600">{task.description}</p>
                <p className="text-xs text-gray-500">
                  Due: {new Date(task.due_date).toLocaleDateString()} |
                  Priority: {task.priority}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm font-medium">Status:</span>
                  <Select
                    size="sm"
                    selectedKeys={[getDisplayStatus(task.status)]}
                    onChange={(e) =>
                      updateStatus(
                        task.id,
                        e.target.value as keyof typeof statusMapping
                      )
                    }
                    isDisabled={taskLoading}>
                    <SelectItem key="in-progress">In Progress</SelectItem>
                    <SelectItem key="stale">Stale</SelectItem>
                    <SelectItem key="done">Done</SelectItem>
                  </Select>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>Create Task</ModalHeader>
          <ModalBody className="space-y-3">
            <Input
              label="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <Textarea
              label="Description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
            <Input
              label="Due Date"
              type="date"
              value={form.due_date}
              onChange={(e) => setForm({ ...form, due_date: e.target.value })}
            />
            <Select
              label="Priority"
              selectedKeys={[String(form.priority)]}
              onChange={(e) =>
                setForm({ ...form, priority: Number(e.target.value) })
              }>
              <SelectItem key="1">Low</SelectItem>
              <SelectItem key="2">Medium</SelectItem>
              <SelectItem key="3">High</SelectItem>
            </Select>
            <Select
              label="Status"
              selectedKeys={[form.status]}
              onChange={(e) =>
                setForm({
                  ...form,
                  status: e.target.value as "in-progress" | "stale" | "done",
                })
              }>
              <SelectItem key="in-progress">In Progress</SelectItem>
              <SelectItem key="stale">Stale</SelectItem>
              <SelectItem key="done">Done</SelectItem>
            </Select>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onClose}>
              Cancel
            </Button>
            <Button color="primary" onPress={handleTaskCreate}>
              Create
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default Page;
