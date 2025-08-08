"use client";

import "../page.css";
import Header from "../../Header/page";
import { useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Footer from "@/app/Footer/page";
import { getFirebaseToken } from "@/utils";
import { useRouter } from "next/navigation";

export default function Account() {
  interface TeamMember {
    name: string;
    designation: string;
    mobile: string;
    email: string;
  }

  const [displayName, setDisplayName] = useState("");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const [formData, setFormData] = useState<TeamMember>({
    name: "",
    designation: "",
    mobile: "",
    email: "",
  });
  const [editingEmail, setEditingEmail] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const getSocietyByEmail = async (email: string | null | undefined) => {
    try {
      const res = await fetch(
        `/api/society/team?email=${encodeURIComponent(email || "")}`,
      );
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || "Failed to fetch society data");
      setTeam(data.society.team);
      setDisplayName(data.society.name);
      setError(null);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        getSocietyByEmail(user?.email);
      } else {
        setTimeout(() => {
          router.push("/");
        }, 500);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async () => {
    if (!currentUser) return;

    const body = editingEmail
      ? {
          societyEmail: currentUser.email,
          memberEmail: editingEmail,
          updates: formData,
        }
      : { societyEmail: currentUser.email, newMember: formData };

    const method = editingEmail ? "PATCH" : "POST";
    const token = await getFirebaseToken();
    const res = await fetch("/api/society/team", {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      setFormData({ name: "", designation: "", mobile: "", email: "" });
      setEditingEmail(null);
      setIsAdding(false);
      getSocietyByEmail(currentUser.email);
    }
  };
  const [isMemberEmailToDelete, setIsMemberEmailToDelete] = useState(false);
  const [memberEmailToDelete, setMemberEmailToDelete] = useState("");
  const handleDeleteConfirmation = (email: string) => {
    if (!currentUser) return;
    setIsMemberEmailToDelete(true);
    setMemberEmailToDelete(email);
  };

  const handleDelete = async (email: string) => {
    if (!currentUser) return;
    const token = await getFirebaseToken();
    const res = await fetch("/api/society/team", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        societyEmail: currentUser.email,
        memberEmail: email,
      }),
    });

    if (res.ok) {
      getSocietyByEmail(currentUser.email);
    }
  };

  const handleEdit = (member: TeamMember) => {
    setFormData(member);
    setEditingEmail(member.email);
    setIsAdding(false);
    setIsMemberEmailToDelete(false);
    setMemberEmailToDelete("");
  };

  return (
    <>
      <Header />
      <main className="w-[95%] min-h-[85vh] lg:w-full max-w-6xl mx-auto py-10 md:py-16 px-4">
        <h2 className="text-4xl md:text-5xl font-extrabold text-center text-gray-900 mb-12">
          Manage Your Team
        </h2>

        <div className="flex justify-center mb-8">
          <button
            onClick={() => {
              setFormData({ name: "", designation: "", mobile: "", email: "" });
              setIsMemberEmailToDelete(false);
              setMemberEmailToDelete("");
              setEditingEmail(null);
              setIsAdding(true);
            }}
            className="bg-indigo-500 hover:bg-indigo-700 text-white px-6 py-2 rounded-md font-medium transition hover:cursor-pointer"
          >
            + Add Team Member
          </button>
        </div>

        {(isAdding || editingEmail !== null) && (
          <div className="mb-10 bg-gray-50 p-6 rounded-lg shadow-md max-w-xl mx-auto">
            <h3 className="text-xl font-semibold mb-4 text-center">
              {editingEmail ? "Edit Member" : "Add New Member"}
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {["name", "designation", "mobile", "email"].map((field) => (
                <input
                  key={field}
                  type="text"
                  value={formData[field as keyof TeamMember]}
                  onChange={(e) =>
                    setFormData({ ...formData, [field]: e.target.value })
                  }
                  placeholder={field[0].toUpperCase() + field.slice(1)}
                  className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ))}
              <div className="flex gap-4 justify-center mt-2">
                <button
                  onClick={handleSubmit}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md transition hover:cursor-pointer"
                >
                  {editingEmail ? "Update" : "Add"}
                </button>
                <button
                  onClick={() => {
                    setFormData({
                      name: "",
                      designation: "",
                      mobile: "",
                      email: "",
                    });
                    setEditingEmail(null);
                    setIsAdding(false);
                  }}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-5 py-2 rounded-md transition hover:cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <p className="text-center text-gray-600">Loading team data...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : team.length === 0 ? (
          <p className="text-center text-gray-600">No team members found.</p>
        ) : (
          <section
            className={`grid gap-6 sm:grid-cols-2 ${
              team.length === 1
                ? "lg:grid-cols-1"
                : team.length === 2
                  ? "lg:grid-cols-2"
                  : "lg:grid-cols-3"
            }`}
          >
            {team.map((member: TeamMember) => (
              <div
                key={member.email}
                className="bg-white border border-gray-200 rounded-xl shadow-md p-6 transition-all hover:shadow-xl"
              >
                <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                  {member.name}
                </h3>
                <p className="text-base text-gray-600 mb-1">
                  <span className="font-medium">Designation:</span>
                  {member.designation}
                </p>
                <p className="text-base text-gray-600 mb-1">
                  <span className="font-medium">Mobile:</span> {member.mobile}
                </p>
                <p className="text-base text-gray-600">
                  <span className="font-medium">Email:</span> {member.email}
                </p>
                {isMemberEmailToDelete &&
                member.email === memberEmailToDelete ? (
                  <>
                    <div className="mt-2 text-red-600">
                      Are you sure you want to delete?
                    </div>
                    <div className="flex gap-4">
                      <div className="text-red-800">
                        <button
                          onClick={() => handleDelete(member.email)}
                          className="hover:cursor-pointer"
                        >
                          Yes
                        </button>
                      </div>
                      <div>
                        <button
                          onClick={() => {
                            setIsMemberEmailToDelete(false);
                            setMemberEmailToDelete("");
                          }}
                          className="hover:cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex gap-4 mt-4">
                    <button
                      onClick={() => handleEdit(member)}
                      className="text-blue-600 hover:underline text-sm hover:cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteConfirmation(member.email)}
                      className="text-red-600 hover:underline text-sm hover:cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
