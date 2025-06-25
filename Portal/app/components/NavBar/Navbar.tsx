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
    <>
      <Container>
        <div className="navbar bg-base-100 w-full">
          {" "}
          <div className="flex-1">
            <div className="btn btn-ghost normal-case ">
              <Lgog />
            </div>
          </div>
          <div className="flex flex-1 justify-between items-center m-2">
            <div className="flex-grow"></div>
            {/* Navigation Links */}
            <div className="flex items-center space-x-4 lg:space-x-6">
              <button
                onClick={() => router.push('/devices')}
                className="text-sm font-medium text-neutral-700 dark:text-neutral-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Devices
              </button>
              <button
                onClick={() => router.push('/alerts')}
                className="text-sm font-medium text-neutral-700 dark:text-neutral-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                All Alerts
              </button>
            </div>
            <div className="flex-grow"></div>
            <div>
           
            </div>
            <UserMenu currentUser={currentUser} />
          </div>
        </div>
      </Container>

    </>
  );
};

export default Navbar;
