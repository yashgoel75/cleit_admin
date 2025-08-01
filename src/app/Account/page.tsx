"use client";

import "./page.css";
import Header from "../Header/page";
import Footer from "@/app/Footer/page";
import { useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function Account() {
  const [displayName, setDisplayName] = useState("");
  const [societyData, setSocietyData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<any>(null);

  const handleEligibilityChange = (index: number, value: string) => {
    const updated = [...formData.eligibility];
    updated[index].name = value;
    setFormData((prev: any) => ({ ...prev, eligibility: updated }));
  };

  const handleAddEligibility = () => {
    setFormData((prev: any) => ({
      ...prev,
      eligibility: [...(prev?.eligibility || []), { name: "" }],
    }));
  };

  const handleRemoveEligibility = (index: number) => {
    const updated = [...formData.eligibility];
    updated.splice(index, 1);
    setFormData((prev: any) => ({ ...prev, eligibility: updated }));
  };

  const handleSocialChange = (
    index: number,
    field: "name" | "handle",
    value: string,
  ) => {
    const updated = [...formData.social];
    updated[index][field] = value;
    setFormData((prev: any) => ({ ...prev, social: updated }));
  };

  const handleAddSocial = () => {
    setFormData((prev: any) => ({
      ...prev,
      social: [...(prev?.social || []), { name: "", handle: "" }],
    }));
  };

  const handleRemoveSocial = (index: number) => {
    const updated = [...formData.social];
    updated.splice(index, 1);
    setFormData((prev: any) => ({ ...prev, social: updated }));
  };

  const handleUpdate = async () => {
    try {
      const res = await fetch("/api/society/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          societyEmail: currentUser?.email,
          updates: formData,
        }),
      });

      if (!res.ok) throw new Error("Failed to update society");

      setIsEdit(false);
      getSocietyByEmail(currentUser?.email);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const getSocietyByEmail = async (email: string | null | undefined) => {
    try {
      const res = await fetch(
        `/api/society/team?email=${encodeURIComponent(email || "")}`,
      );
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || "Failed to fetch society data");
      setSocietyData(data.society);
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
      if (user?.email) {
        getSocietyByEmail(user.email);
        setCurrentUser(user);
      }
    });
    return () => unsubscribe();
  }, []);

  const [isEdit, setIsEdit] = useState(false);
  const [isPreview, setIsPreview] = useState(true);

  return (
    <>
      <Header />
      <div className="border-t border-gray-300 mt-2"></div>
      <main className="w-[95%] min-h-[85vh] lg:w-full max-w-6xl mx-auto py-10 md:py-16 px-4">
        <h2 className="text-4xl md:text-5xl font-extrabold text-center text-gray-900 mb-12">
          Manage Your Society Account
        </h2>
        <div className="flex justify-center items-center gap-4 pb-10 font-medium">
          <button
            onClick={() => {
              setIsPreview(false);
              setIsEdit(true);
            }}
            className={`px-5 py-2 rounded-md border transition duration-300 ${
              isEdit
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white text-indigo-600 border-indigo-600 hover:bg-indigo-50"
            }`}
          >
            Edit
          </button>
          <button
            onClick={() => {
              setIsEdit(false);
              setIsPreview(true);
            }}
            className={`px-5 py-2 rounded-md border transition duration-300 ${
              isPreview
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white text-indigo-600 border-indigo-600 hover:bg-indigo-50"
            }`}
          >
            Preview
          </button>
        </div>

        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : isPreview ? (
          <div className="space-y-10">
            <section className="text-center">
              <img
                src={societyData?.logo}
                alt={`${societyData?.name} logo`}
                className="mx-auto w-32 h-32 object-cover rounded-full border shadow"
              />
              <h3 className="text-3xl font-bold mt-4">{societyData?.name}</h3>
              <p className="text-gray-600 text-lg">@{societyData?.username}</p>
              <p className="text-gray-700 mt-2">{societyData?.about}</p>
              <p className="text-gray-500 mt-1">{societyData?.email}</p>
              <p className="mt-2 text-sm font-medium">
                🎭 Auditions:&nbsp;
                <span
                  className={
                    societyData?.auditionOpen
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {societyData?.auditionOpen ? "Open" : "Closed"}
                </span>
              </p>
            </section>

            <section>
              <h4 className="text-2xl font-semibold mb-4">Team Members</h4>
              <div className="grid md:grid-cols-2 gap-6">
                {societyData?.team?.map((member: any, index: number) => (
                  <div
                    key={index}
                    className="bg-white border border-gray-200 rounded-xl shadow-md p-6 transition-all hover:shadow-xl"
                  >
                    <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                      {member.name}
                    </h3>
                    <p className="text-base text-gray-600 mb-1">
                      <span className="font-medium">Designation:&nbsp;</span>
                      {member.designation}
                    </p>
                    <p className="text-base text-gray-600 mb-1">
                      <span className="font-medium">Mobile:</span>{" "}
                      {member.mobile}
                    </p>
                    <p className="text-base text-gray-600">
                      <span className="font-medium">Email:</span> {member.email}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h4 className="text-2xl font-semibold mb-4">Social Links</h4>
              <ul className="space-y-2">
                {societyData?.social?.map((s: any, i: number) => (
                  <li key={i} className="text-blue-600 hover:underline">
                    {s.name}:{" "}
                    <a href={s.handle} target="_blank">
                      {s.handle}
                    </a>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h4 className="text-2xl font-semibold mb-4">
                Eligibility Criteria
              </h4>
              <ul className="list-disc list-inside text-gray-700">
                {societyData?.eligibility?.map((e: any, i: number) => (
                  <li key={i}>{e.name}</li>
                ))}
              </ul>
            </section>
          </div>
        ) : (
          <>
            <div className="space-y-10">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleUpdate();
                }}
                className="space-y-8"
              >
                <section className="bg-white p-6 rounded-xl shadow-md">
                  <h3 className="text-2xl font-semibold mb-4 text-center">
                    Edit Society Info
                  </h3>
                  <div className="grid gap-4">
                    {["name", "username", "email", "about", "logo"].map(
                      (field) => (
                        <input
                          key={field}
                          type="text"
                          value={formData?.[field] || ""}
                          onChange={(e) =>
                            setFormData((prev: any) => ({
                              ...prev,
                              [field]: e.target.value,
                            }))
                          }
                          placeholder={
                            field.charAt(0).toUpperCase() + field.slice(1)
                          }
                          className="p-3 border border-gray-300 rounded-md w-full"
                        />
                      ),
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      <label className="text-gray-700 font-medium">
                        Auditions:
                      </label>
                      <select
                        value={formData?.auditionOpen ? "true" : "false"}
                        onChange={(e) =>
                          setFormData((prev: any) => ({
                            ...prev,
                            auditionOpen: e.target.value === "true",
                          }))
                        }
                        className="p-2 border rounded-md"
                      >
                        <option value="true">Open</option>
                        <option value="false">Closed</option>
                      </select>
                    </div>
                  </div>
                </section>

                {/* Social Links */}
                <section className="bg-white p-6 rounded-xl shadow-md">
                  <h3 className="text-2xl font-semibold mb-4 text-center">
                    Social Links
                  </h3>
                  <div className="space-y-2">
                    {formData?.social?.map((s: any, idx: number) => (
                      <div key={idx} className="flex gap-2">
                        <input
                          type="text"
                          value={s.name}
                          onChange={(e) =>
                            handleSocialChange(idx, "name", e.target.value)
                          }
                          placeholder="Platform"
                          className="p-2 border rounded-md w-1/3"
                        />
                        <input
                          type="text"
                          value={s.handle}
                          onChange={(e) =>
                            handleSocialChange(idx, "handle", e.target.value)
                          }
                          placeholder="URL"
                          className="p-2 border rounded-md flex-1"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveSocial(idx)}
                          className="text-red-600 hover:underline"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={handleAddSocial}
                      className="mt-2 text-blue-600 hover:underline"
                    >
                      + Add Social
                    </button>
                  </div>
                </section>

                {/* Eligibility */}
                <section className="bg-white p-6 rounded-xl shadow-md">
                  <h3 className="text-2xl font-semibold mb-4 text-center">
                    Eligibility Criteria
                  </h3>
                  <div className="space-y-2">
                    {formData?.eligibility?.map((e: any, idx: number) => (
                      <div key={idx} className="flex gap-2">
                        <input
                          type="text"
                          value={e.name}
                          onChange={(ev) =>
                            handleEligibilityChange(idx, ev.target.value)
                          }
                          placeholder="Eligibility"
                          className="p-2 border rounded-md w-full"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveEligibility(idx)}
                          className="text-red-600 hover:underline"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={handleAddEligibility}
                      className="mt-2 text-blue-600 hover:underline"
                    >
                      + Add Eligibility
                    </button>
                  </div>
                </section>

                <div className="flex justify-center gap-4">
                  <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md font-semibold transition"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEdit(false);
                      setFormData(societyData);
                    }}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-md font-semibold transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
