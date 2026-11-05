"use client";
import React from "react";
// import Button from "../components/Button"; // Button may not be needed anymore
import { SafeUser } from "../types";
// import Collapse from "../components/Collapse"; // Collapse may not be needed
// import useProfilePicModal from "../hooks/useProfilePicModal"; // Removed
// import ProfilePicModal from "../components/modals/ProfilePicModal"; // Removed
// import useUpdateBody from "../hooks/useBodyModal"; // Removed
// import { MdAccountBalanceWallet } from "react-icons/md"; // Not used
// import Image from "next/image"; // Not used

interface ProfileBoxProps {
  currentUser: SafeUser;
}

const ProfileBox: React.FC<ProfileBoxProps> = ({ currentUser }) => {
  // const profilePicModal = useProfilePicModal(); // Removed
  // const updateBodyModal = useUpdateBody(); // Removed
  return (
    <>
      <div className="flex justify-center items-center m-2">
        {/* <ProfilePicModal /> Removed */}
        <div>
          <div className="flex items-center flex-col bg-violet-600/10 rounded-lg w-auto h-auto min-h-16 p-4">
            <div
              className="flex items-center flex-col bg-violet-700/20 rounded-lg w-auto h-auto min-h-16 p-4 space-y-2"
              style={{ backdropFilter: "10px" }}
            >
              <div className="text-2xl font-extrabold">
                {currentUser.name || "User"}
              </div>
              <div className="font-semibold text-lg">
                {currentUser.email}
              </div>
              <div className="font-semibold text-md">
                Role: {currentUser.role}
              </div>
              {/* Avatar and update buttons removed */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfileBox;
