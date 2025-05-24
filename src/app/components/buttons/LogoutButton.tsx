"use client";
import React, { useTransition } from "react";
import { deleteCookie } from "cookie-handler-pro";
import { useRouter } from "next/navigation"; // Correct router import
import { RiLogoutCircleRLine } from "react-icons/ri";

const LogoutButton = () => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition(); // Ensures smooth navigation without UI blocking

  const handleLogout = () => {
    // Delete authentication cookies
    deleteCookie("token");
    localStorage.removeItem("refreshToken");

    // Use transition to ensure proper navigation handling
    startTransition(() => {
      router.replace("/login"); // Use replace to avoid back button issues
      router.refresh(); // Ensures UI updates properly
    });
  };

  return (
    <button
      disabled={isPending}
      className="flex flex-row justify-start items-center bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 disabled:opacity-50"
      onClick={handleLogout}>
      {/* {isPending ? "Logging Out..." : "Log Out"}{" "} */}
      Log Out
      <RiLogoutCircleRLine className="mx-1" />
    </button>
  );
};

export default LogoutButton;
