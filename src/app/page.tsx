"use client";

import Image from "next/image";
import logo from "@/assets/cleit.png";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Footer from "./Footer/page";
import { getAuth, signOut, onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";

import "./page.css";
import { log } from "console";
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

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSocietyName = async (email: string) => {
    try {
      const response = await fetch(
        `/api/society/team?email=${encodeURIComponent(email)}`,
      );
      const data = await response.json();

      if (!response.ok)
        throw new Error(data.error || "Failed to fetch society data");
      setDisplayName(data.society.name);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      console.log(user?.email);
      if (user?.email) fetchSocietyName(user.email);
    });

    return () => unsubscribe();
  }, []);

  async function logout() {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        // Sign-out successful.
      })
      .catch((error) => {
        // An error happened.
      });
  }

  return (
    <>
      <div className="flex justify-between px-5 items-center">
        <Image
          src={logo}
          className="md:px-5"
          width={isMobile ? 150 : 250}
          alt="Cleit"
        ></Image>
        {currentUser ? (
          <div className="hidden lg:flex items-center text-lg lg:text-[26px] font-medium gap-4">
            <button
              className="hover:cursor-pointer"
              onClick={() => router.push("/Account")}
            >
              {displayName}
            </button>
          </div>
        ) : null}
        {!currentUser ? (
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
        ) : (
          <div className="flex items-center gap-4">
            <nav className="font-medium md:text-lg lg:text-xl">
              <ul className="flex gap-5">
                <li onClick={() => router.push("/Account/Events")}>
                  <button className="hover:underline cursor-pointer">
                    Events
                  </button>
                </li>
                <li onClick={() => router.push("/Account/Team")}>
                  <button className="hover:underline cursor-pointer">
                    Team
                  </button>
                </li>
              </ul>
            </nav>
            <div title="Logout" className="cursor-pointer">
              <svg
                onClick={logout}
                className="mr-5"
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill="#000000"
              >
                <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h280v80H200Zm440-160-55-58 102-102H360v-80h327L585-622l55-58 200 200-200 200Z" />
              </svg>
            </div>
          </div>
        )}
      </div>
      <div className="border-1 border-gray-200 mt-2" />

      <div className="flex justify-center items-center min-h-[80vh] onest-bold md:text-lg">
        <div className="space-y-2 md:space-y-3"></div>
      </div>
      <Footer />
    </>
  );
}
