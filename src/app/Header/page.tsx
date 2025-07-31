"use client";

import logo from "@/assets/cleit.png";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Header() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const router = useRouter();

  return (
    <>
      <div className="flex items-center justify-between px-5">
        <Image
          src={logo}
          className="md:px-5"
          width={isMobile ? 150 : 250}
          alt="Cleit"
        ></Image>
        <div className="block lg:hidden mr-5">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
            fill="#000000"
          >
            <path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z" />
          </svg>
        </div>
        <div className="lg:flex hidden items-center gap-4">
          <ul className="flex items-center text-lg gap-4"></ul>
        </div>
        <div className="lg:flex hidden items-center gap-4 mr-5">
          <div
            onClick={() => router.push("/auth/Login")}
            className="px-3  text-[17px] py-1 bg-indigo-500 text-white border-indigo-500 border-1 rounded-md hover:cursor-pointer hover:bg-indigo-700"
          >
            Login
          </div>
          <div
            onClick={() => router.push("/auth/Register")}
            className="px-3 text-[17px] py-1 mr-5 rounded-md border-1 border-gray-300 hover:bg-zinc-100 hover:cursor-pointer"
          >
            Register
          </div>
        </div>
      </div>
    </>
  );
}
