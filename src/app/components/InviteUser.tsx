"use client";
import React, { useEffect, useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  Button,
  useDisclosure,
} from "@heroui/react";

type User = {
  id: string;
  name: string;
  email: string;
};

type Member = {
  id: string;
  user: User;
  role: "owner" | "admin" | "editor" | "viewer";
};

const InviteUser = ({ appId, token }: { appId: string; token: string }) => {
  const { isOpen, onOpenChange, onOpen } = useDisclosure();

  const [users, setUsers] = useState<User[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<
    "owner" | "admin" | "editor" | "viewer"
  >("viewer");
  const [loading, setLoading] = useState(false);
  const [inviting, setInviting] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:3001/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("Error fetching users", err);
    }
  };

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:3001/app-members/${appId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setMembers(data);
    } catch (err) {
      console.error("Error fetching members", err);
    } finally {
      setLoading(false);
    }
  };

  const inviteUser = async () => {
    if (!selectedUserId || !selectedRole) return;

    try {
      setInviting(true);
      const res = await fetch("http://localhost:3001/app-members", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          appId,
          userId: selectedUserId,
          role: selectedRole,
        }),
      });

      if (res.ok) {
        setSelectedUserId("");
        setSelectedRole("viewer");
        fetchMembers();
      } else {
        console.error("Invite failed");
      }
    } catch (err) {
      console.error("Invite error", err);
    } finally {
      setInviting(false);
    }
  };

  const updateRole = async (memberId: string, newRole: string) => {
    try {
      const res = await fetch(`http://localhost:3001/app-members/${memberId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ appId, role: newRole }),
      });

      if (res.ok) {
        fetchMembers();
      } else {
        console.error("Failed to update role");
      }
    } catch (err) {
      console.error("Role update error", err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      fetchMembers();
    }
  }, [isOpen]);

  return (
    <>
      <Button size="sm" color="secondary" onPress={onOpen}>
        Manage Members
      </Button>

      <Drawer isOpen={isOpen} onOpenChange={onOpenChange}>
        <DrawerContent>
          {(onClose) => (
            <>
              <DrawerHeader>Invite User & Manage Roles</DrawerHeader>

              <DrawerBody className="space-y-4">
                {/* Invite User */}
                <div className="flex gap-2 items-center">
                  <select
                    className="w-1/2 p-2 border rounded"
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                  >
                    <option value="">Select a user</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </select>

                  <select
                    className="w-1/3 p-2 border rounded"
                    value={selectedRole}
                    onChange={(e) =>
                      setSelectedRole(
                        e.target.value as
                          | "owner"
                          | "admin"
                          | "editor"
                          | "viewer"
                      )
                    }
                  >
                    {["owner", "admin", "editor", "viewer"].map((role) => (
                      <option key={role} value={role}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </option>
                    ))}
                  </select>

                  <Button
                    color="primary"
                    isLoading={inviting}
                    onPress={inviteUser}
                    isDisabled={!selectedUserId}
                  >
                    Invite
                  </Button>
                </div>

                {/* Existing Members */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-lg">Current Members</h4>
                  {loading ? (
                    <p>Loading members...</p>
                  ) : (
                    members.map((member) => (
                      <div
                        key={member.id}
                        className="p-3 border rounded flex justify-between items-center"
                      >
                        <div>
                          <div className="font-medium">{member.user.name}</div>
                          <div className="text-sm text-gray-500">
                            {member.user.email}
                          </div>
                        </div>
                        <select
                          className="w-1/3 p-2 border rounded"
                          value={member.role}
                          onChange={(e) =>
                            updateRole(member.id, e.target.value)
                          }
                        >
                          {["owner", "admin", "editor", "viewer"].map(
                            (role) => (
                              <option key={role} value={role}>
                                {role.charAt(0).toUpperCase() + role.slice(1)}
                              </option>
                            )
                          )}
                        </select>
                      </div>
                    ))
                  )}
                </div>
              </DrawerBody>

              <DrawerFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default InviteUser;
