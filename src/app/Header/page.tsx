"use client";

import logo from "@/assets/cleit.png";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuth, signOut, onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function Header() {
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getNameByEmail = async (email: string | null | undefined) => {
    try {
      const res = await fetch(
        `/api/society/team?email=${encodeURIComponent(email || "")}`,
      );
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || "Failed to fetch society data");
      setDisplayName(data.society.name);
      console.log(data.society.name);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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

  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      getNameByEmail(user?.email);
      console.log(user?.email);
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
        {!currentUser ? (
          <div className="lg:flex hidden items-center gap-4 mr-5">
            <div
              onClick={() => router.push("/auth/login")}
              className="px-3  text-[17px] py-1 bg-indigo-500 text-white border-indigo-500 border-1 rounded-md hover:cursor-pointer hover:bg-indigo-700"
            >
              Login
            </div>
            <div
              onClick={() => router.push("/auth/register")}
              className="px-3 text-[17px] py-1 mr-5 rounded-md border-1 border-gray-300 hover:bg-zinc-100 hover:cursor-pointer"
            >
              Register
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <div className="font-medium md:text-lg lg:text-xl">
              {displayName}
            </div>
            <div title="Logout">
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
    </>
  );
}
