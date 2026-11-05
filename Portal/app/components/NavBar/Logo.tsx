"use client";
import { useRouter } from "next/navigation";
import { AiFillHome } from "react-icons/ai";
import ClientOnly from "../ClientOnly";

const Lgog = () => {
  const router = useRouter();

  const handleClick = () => {
    router.push("/");
  };

  return (
    <ClientOnly>
      <button
        onClick={handleClick}
        className="text-white hover:text-blue-400 transition-colors p-2"
        title="Home"
      >
        <AiFillHome size={32} />
      </button>
    </ClientOnly>
  );
};

export default Lgog;
