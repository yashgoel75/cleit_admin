"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuth, signOut, onAuthStateChanged, User } from "firebase/auth";

import logo from "@/assets/cleit.png";
import { auth } from "@/lib/firebase";
import "./page.css";

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    const updateSize = () => setIsMobile(window.innerWidth <= 768);
    updateSize();

    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user?.email) fetchSocietyName(user.email);
    });

    return () => unsubscribe();
  }, []);

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

  const handleLogout = async () => {
    try {
      await signOut(getAuth());
      setUser(null);
      router.push("/auth/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <header className="flex items-center justify-between px-5">
      <Image
        src={logo}
        width={isMobile ? 150 : 250}
        alt="Cleit"
        className="md:px-5"
      />

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
      {user ? (
        <div className="hidden lg:flex items-center text-lg lg:text-[26px] font-medium gap-4">
          <button
            className="hover:cursor-pointer"
            onClick={() => router.push("/Account")}
          >
            {displayName}
          </button>
        </div>
      ) : null}

      {!user ? (
        <div className="hidden lg:flex items-center gap-4 mr-5">
          <button
            onClick={() => router.push("/auth/login")}
            className="px-3 py-1 text-[17px] bg-indigo-500 text-white rounded-md hover:bg-indigo-700 hover:cursor-pointer"
          >
            Login
          </button>
          <button
            onClick={() => router.push("/auth/register")}
            className="px-3 py-1 text-[17px] border border-gray-300 rounded-md hover:bg-zinc-100 hover:cursor-pointer"
          >
            Register
          </button>
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
                <button className="hover:underline cursor-pointer">Team</button>
              </li>
            </ul>
          </nav>
          <div title="Logout" className="cursor-pointer">
            <svg
              onClick={handleLogout}
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
    </header>
  );
}
