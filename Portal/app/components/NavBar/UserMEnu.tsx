"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { SafeUser } from "@/app/types";
import MenuItem from "./MenuItem";
import useLoginModal from "@/app/hooks/useLoginModal";
import useRegisterModal from "@/app/hooks/useRegisterModal";
import { TiUser } from "react-icons/ti";
import { AiOutlineLogout } from "react-icons/ai";
import { GrUserNew } from "react-icons/gr";
import { PiSignInLight } from "react-icons/pi";
import { BsPlus } from "react-icons/bs";
import { useRouter } from "next/navigation";
import { BiHome } from "react-icons/bi";

interface UserMenuProps {
  currentUser?: SafeUser | null;
}

const UserMenu: React.FC<UserMenuProps> = ({ currentUser }) => {
  const [isOpen, setIsOpen] = useState(false);
  const registerModal = useRegisterModal();
  const loginModal = useLoginModal();
  const router = useRouter();

  const toggleOpen = () => setIsOpen(!isOpen);

  // Admin view
  if (currentUser?.email === "guri2022@hotmail.com") {
    return (
      <div className="relative ml-4">
        <button onClick={toggleOpen} className="btn btn-primary">Admin Menu</button>
        {isOpen && (
          <ul className="absolute right-0 mt-2 z-50 w-52 p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box">
            <li className="text-center text-primary text-xl">
              Welcome To Admin Portal
            </li>
            <MenuItem label="Add New" onClick={() => {}} icon={<BsPlus />} />
            <MenuItem
              label="Logout"
              onClick={() =>
                signOut({
                  redirect: false,
                  callbackUrl: "https://main.d1emtjc4kvp6hm.amplifyapp.com/",
                })
              }
              icon={<AiOutlineLogout />}
            />
          </ul>
        )}
      </div>
    );
  }

  // User or Guest view
  return (
    <div className="relative ml-4">
      {currentUser ? (
        <>
          <button onClick={toggleOpen} className="btn btn-primary">
            Menu
          </button>
          {isOpen && (
            <ul className="absolute right-0 mt-2 z-50 w-52 p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box">
              <li className="text-center text-red-300 text-xl">
                Hi, {currentUser.name}
              </li>
              <MenuItem label="Home" onClick={() => router.push("/")} icon={<BiHome />} />
              <MenuItem
                label="Profile"
                onClick={() => router.push("/Profile")}
                icon={<TiUser />}
              />
              <MenuItem label="Logout" onClick={signOut} icon={<AiOutlineLogout />} />
            </ul>
          )}
        </>
      ) : (
        <div className="flex flex-col gap-2 items-start">
          {/* Login Button */}
          <button
            onClick={loginModal.onOpen}
            className="text-white hover:text-green-300 transition-colors p-2 flex items-center space-x-2"
            title="Login"
          >
            <PiSignInLight size={22} />
        
          </button>

          {/* Sign Up Button */}
          <button
            onClick={registerModal.onOpen}
            className="text-white hover:text-green-300 transition-colors p-2 flex items-center space-x-2"
            title="Sign Up"
          >
            <GrUserNew size={20} />
        
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
