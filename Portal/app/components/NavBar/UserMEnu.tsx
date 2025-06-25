import { useState } from "react";
import { signOut } from "next-auth/react";
import { SafeUser } from "@/app/types";
import MenuItem from "./MenuItem";
import useLoginModal from "@/app/hooks/useLoginModal";
import useRegisterModal from "@/app/hooks/useRegisterModal";
import Avatar from "../Avatar";
import { TiUser } from "react-icons/ti";
import { AiOutlineLogout } from "react-icons/ai";
// import { MdOutlineFavoriteBorder, MdHistory } from "react-icons/md"; // Removed unused
// import { IoIosLogIn } from "react-icons/io"; // Removed unused
import { GrUserNew } from "react-icons/gr";
import { PiSignInLight } from "react-icons/pi";
// import { IoFitnessSharp } from "react-icons/io5"; // Removed unused
// import { BsPlus } from "react-icons/bs"; // Removed unused
// import { PiMoneyBold } from "react-icons/pi"; // Removed unused
// import useAddModal from "@/app/hooks/useAddModal"; // Removed
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
  // const addModal = useAddModal(); // Removed
  const toggleOpen = () => setIsOpen(!isOpen);
  // Role is defined in prisma schema as enum UserRole { USER ADMIN MAINTENANCE }
  // Assuming SafeUser includes the role property
  if (currentUser?.role === "ADMIN") {
    return (
      <div className="dropdown dropdown-end">
        <button
          onClick={toggleOpen}
          className="btn btn-ghost btn-circle avatar"
        >
          <div className="w-10 rounded-full">
            <Avatar
              src={currentUser?.image}
              alt={currentUser?.name || "User avatar"}
            />
          </div>
        </button>
        {isOpen && (
          <ul
            tabIndex={0}
            className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52"
          >
            <li className="text-center text-primary text-xl">
              Admin Menu
            </li>
            <MenuItem
              label="Dashboard"
              onClick={() => router.push('/dashboard')}
              icon={<BiHome />} // Re-using BiHome, consider a dashboard specific icon
            />
            {/* Add Admin specific links here in the future e.g.
            <MenuItem
              label="User Management"
              onClick={() => router.push('/admin/users')}
              icon={<TiUser />} // Example icon
            />
            */}
            <MenuItem
              label="Logout"
              onClick={() => signOut()} // Standardized logout
              icon={<AiOutlineLogout />}
            />
          </ul>
        )}
      </div>
    );
  }
  return (
    <div className="flex flex-row ml-2">
      <div className="dropdown dropdown-end">
      
        <button
          onClick={toggleOpen}
          className="btn btn-ghost btn-circle avatar"
        >
          {" "}
          <div className="w-10 rounded-full">
            <Avatar
              src={currentUser?.image}
              alt={currentUser?.name || "User avatar"}
            />
          </div>
        </button>
        {isOpen && (
          <>
            {currentUser ? (
              <ul
                tabIndex={0}
                className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52"
              >
                <li className="text-center text-red-300 text-xl">
                  Hi,{currentUser.name}
                </li>
                <MenuItem
                  label="Dashboard"
                  onClick={() => router.push("/dashboard")}
                  icon={<BiHome />} // Re-using BiHome, consider a dashboard specific icon
                />
                <MenuItem
                  label="Profile "
                  onClick={() => {
                    router.push("/Profile");
                  }}
                  icon={<TiUser />}
                />
              
                <MenuItem
                  label="Logout"
                  onClick={signOut}
                  icon={<AiOutlineLogout />}
                />
              </ul>
            ) : (
              <ul
                tabIndex={0}
                className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52"
              >
                <MenuItem
                  label="Login"
                  onClick={loginModal.onOpen}
                  icon={<PiSignInLight />}
                />
                <MenuItem
                  label="Sign Up"
                  onClick={registerModal.onOpen}
                  icon={<GrUserNew />}
                />
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UserMenu;
