"use client";

import Image from "next/image";
import logo from "@/assets/cleit.png";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Footer from "./Footer/page";

import "./page.css";
export default function Home() {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsMobile(true);
    }
  }, []);

  const handleRegisterButton = () => {
    router.push("/auth/register");
  };
  const handleLoginButton = () => {
    router.push("/auth/login");
  };

  return (
    <>
      <div className="flex justify-between px-10 items-center">
        <Image src={logo} width={isMobile ? 150 : 250} alt="Cleit"></Image>
        <div className="flex gap-4">
          <div
            onClick={handleRegisterButton}
            className="px-2 md:px-3 py-1 rounded-md bg-red-600 text-white text-center hover:cursor-pointer"
          >
            Register your Society
          </div>
          <div
            onClick={handleLoginButton}
            className="px-2 md:px-3 py-1 rounded-md bg-orange-600 text-white text-center hover:cursor-pointer"
          >
            Login to your Society
          </div>
        </div>
      </div>
      <div className="flex justify-center items-center min-h-[80vh] onest-bold md:text-lg">
        <div className="space-y-2 md:space-y-3"></div>
      </div>
      <Footer />
    </>
  );
}
