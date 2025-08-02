"use client";
import Header from "./Header/page";
import "./page.css";
import { useState, useEffect } from "react";
import { getAuth, signOut, onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Footer from "./Footer/page";

export default function Account() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  return (
    <>
      <Header />

      <main className="min-h-[85vh] flex justify-center items-center px-4 bg-gradient-to-br from-white via-gray-50 to-white onest-normal">
        <div className="max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-gray-900">
            Put your society on the map —
            <br />
            <span className="bg-indigo-100 px-2 rounded-md text-gray-900">
              manage members, post events,
            </span>
            &nbsp; and&nbsp;
            <span className="text-indigo-600 underline underline-offset-4 decoration-2">
              grow your reach.
            </span>
          </h1>

          <p className="mt-6 text-gray-500 text-lg md:text-xl">
            Your society&apos;s digital home — simple, beautiful, and
            student-focused.
          </p>

          <div className="mt-8">
            <a
              href={user ? "/Account" : "/auth/login"}
              className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition transform hover:scale-105"
            >
              Start Building
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
