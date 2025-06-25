"use client";
import React from "react";
import { SafeUser } from "@/app/types";
import UserMenu from "./UserMEnu";
import { IoAlert } from "react-icons/io5";
import { AiFillHome } from "react-icons/ai"; // Home icon
import { useRouter } from "next/navigation";

interface NavBarProps {
  currentUser?: SafeUser | null;
  totalAlerts?: number;
}

const Navbar: React.FC<NavBarProps> = ({ currentUser }) => {
  const router = useRouter();

  return (
    <div className="fixed top-0 left-0 h-screen w-35 bg-neutral-800 text-white flex flex-col justify-between shadow-lg z-50">
      {/* Top Section: Logo and Navigation Links */}
      <div className="p-4">
        <nav className="flex flex-col space-y-4">
          {/* Home Button */}
          <button
            onClick={() => router.push("/")}
            className="text-white hover:text-green-300 transition-colors p-2 flex items-center space-x-2"
            title="Home"
          >
            <AiFillHome size={22} />

          </button>

          {/* Devices */}
          <button
            onClick={() => router.push("/devices")}
            className="text-white hover:text-green-300 transition-colors p-2 text-left"
          >
            Devices
          </button>

          {/* Alerts */}
          <button
            onClick={() => router.push("/alerts")}
            className="text-white hover:text-green-300 transition-colors p-2 flex items-center space-x-2"
            title="All Alerts"
          >
            <IoAlert size={22} />
           
          </button>
        </nav>
      </div>

      {/* Bottom Section: User Menu */}
      <div className="p-4">
        <UserMenu currentUser={currentUser} />
      </div>
    </div>
  );
};

export default Navbar;
