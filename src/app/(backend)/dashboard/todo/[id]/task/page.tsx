"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getCookie } from "cookie-handler-pro";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
  Input,
  Checkbox,
} from "@heroui/react";

type Task = {
  id: string;
  title: string;
  status: "pending" | "completed";
  created_at: string;
};

const TaskPage = () => {
  const { id: appId } = useParams();
  const token = getCookie("token");
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [createError, setCreateError] = useState("");

  // Fetch tasks
  const fetchTasks = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/to-do-app/${appId}/tasks`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch tasks");
      const data: Task[] = await res.json();
      setTasks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && appId) {
      fetchTasks();
    }
  }, [appId, token]);

  // Create Task
  const handleCreateTask = async () => {
    if (!newTaskTitle.trim()) {
      setCreateError("Task title is required");
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/to-do-app/${appId}/tasks`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ title: newTaskTitle }),
        }
      );

      if (!res.ok) throw new Error("Failed to create task");
      setNewTaskTitle("");
      setCreateError("");
      onClose();
      await fetchTasks(); // Refresh task list
    } catch (err) {
      console.error(err);
      setCreateError("Failed to create task");
    }
  };

  // Toggle status
  const handleToggleStatus = async (taskId: string, currentStatus: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/task/${taskId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: currentStatus === "completed" ? "pending" : "completed",
          }),
        }
      );

      if (!res.ok) throw new Error("Failed to update status");
      await fetchTasks(); // Refresh
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-black dark:text-white">
          Task List
        </h1>
        <Button onPress={onOpen}>+ Add Task</Button>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <ul className="space-y-3">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="flex justify-between items-center bg-white dark:bg-gray-800 rounded p-4 shadow">
              <div className="flex items-center gap-3">
                <Checkbox
                  isSelected={task.status === "completed"}
                  onChange={() => handleToggleStatus(task.id, task.status)}
                />
                <span
                  className={`${
                    task.status === "completed"
                      ? "line-through text-gray-400"
                      : "text-black dark:text-white"
                  }`}>
                  {task.title}
                </span>
              </div>
              <small className="text-xs text-gray-400">
                {new Date(task.created_at).toLocaleString()}
              </small>
            </li>
          ))}
        </ul>
      )}

      {/* Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Create New Task</ModalHeader>
              <ModalBody>
                <Input
                  type="text"
                  label="Task Title"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                />
                {createError && (
                  <p className="text-red-500 text-sm mt-2">{createError}</p>
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="primary" onPress={handleCreateTask}>
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

export default TaskPage;
