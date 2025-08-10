"use client";

import "./page.css";
import Header from "../Header/page";
import Footer from "@/app/Footer/page";
import { useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import linkedin from "@/assets/LinkedIn.png";
import instagram from "@/assets/Instagram.png";
import Image from "next/image";
import { getFirebaseToken } from "@/utils";

export default function Account() {
  interface EligibilityCriterion {
    name: string;
  }

  interface SocialLink {
    name: "LinkedIn" | "Instagram" | string;
    handle: string;
  }

  interface TeamMember {
    name: string;
    designation: string;
    mobile: string;
    email: string;
  }

  interface Event {
    _id: string;
    title: string;
    type?: string;
    venue: string;
    time: string;
    startDate: string;
    endDate?: string;
    about: string;
    socialGroup?: string;
  }

  interface Society {
    name: string;
    username: string;
    email: string;
    logo: string;
    website: string;
    about: string;
    auditionOpen: boolean;
    centralized: boolean;
    team: TeamMember[];
    events: Event[];
    social: SocialLink[];
    eligibility: EligibilityCriterion[];
    type: string;
    facultyCoordinator: string;
  }

  const [usernameAlreadyTaken, setUsernameAlreadyTaken] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(false);
  const [societyData, setSocietyData] = useState<Society | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<Society | null>(null);
  const [isEdit, setIsEdit] = useState(false);
  const [isPreview, setIsPreview] = useState(true);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [deletePending, setDeletePending] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  const router = useRouter();
  async function handleDelete() {
    try {
      const email = currentUser?.email;
      if (!email || !password) {
        console.error("Email or password missing");
        return;
      }

      const auth = getAuth();

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      const token = await user.getIdToken();
      setDeleteSuccess(false);
      setDeletePending(true);

      const res = await fetch(`/api/society/account`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          societyEmail: email,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        console.error("API Error:", data);
        return;
      }

      await user.delete();
      console.log("User account deleted successfully.");
      setDeletePending(false);
      setDeleteSuccess(true);
      router.push("/");
    } catch (error) {
      console.error("Deletion error:", error);
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user?.email) {
        setCurrentUser(user);
        getSocietyByEmail(user.email);
      } else {
        setCurrentUser(null);
        setSocietyData(null);
        setLoading(false);
        setTimeout(() => {
          router.push("/");
        }, 500);
      }
    });
    return () => unsubscribe();
  }, []);

  const getSocietyByEmail = async (email: string | null | undefined) => {
    if (!email) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/society/team?email=${encodeURIComponent(email)}`,
      );
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || "Failed to fetch society data");
      setSocietyData(data.society);
      setFormData(data.society);
      setLogoPreview(data.society?.logo || null);
      setError(null);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEligibilityChange = (index: number, value: string) => {
    if (!formData) return;
    const updated = [...formData.eligibility];
    updated[index].name = value;
    setFormData({ ...formData, eligibility: updated });
  };

  const handleAddEligibility = () => {
    if (!formData) return;
    setFormData({
      ...formData,
      eligibility: [...formData.eligibility, { name: "" }],
    });
  };

  const handleRemoveEligibility = (index: number) => {
    if (!formData) return;
    const updated = [...formData.eligibility];
    updated.splice(index, 1);
    setFormData({ ...formData, eligibility: updated });
  };

  const handleSocialChange = (
    index: number,
    field: "name" | "handle",
    value: string,
  ) => {
    if (!formData) return;
    const updated = [...formData.social];
    updated[index][field] = value;
    setFormData({ ...formData, social: updated });
  };

  const handleAddSocial = () => {
    if (!formData) return;
    setFormData({
      ...formData,
      social: [...formData.social, { name: "LinkedIn", handle: "" }],
    });
  };

  const handleRemoveSocial = (index: number) => {
    if (!formData) return;
    const updated = [...formData.social];
    updated.splice(index, 1);
    setFormData({ ...formData, social: updated });
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleUpdate = async () => {
    if (!currentUser || !formData) return;
    setIsUpdating(true);
    const updatedData = { ...formData };

    try {
      if (logoFile) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", logoFile);
        uploadFormData.append("upload_preset", "cleit_admin_logo");
        const cloudinaryUploadUrl = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`;
        const response = await fetch(cloudinaryUploadUrl, {
          method: "POST",
          body: uploadFormData,
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error?.message || "Cloudinary upload failed");
        }
        updatedData.logo = data.secure_url;
      }
      if (usernameAlreadyTaken) return;
      const token = await getFirebaseToken();
      const res = await fetch("/api/society/account", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          societyEmail: currentUser?.email,
          updates: updatedData,
        }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update society");
      }

      await currentUser.reload();
      setSuccess(true);
      setIsEdit(false);
      setIsPreview(true);
      setLogoFile(null);
      setSuccess(false);
      setUsernameAvailable(false);
      await getSocietyByEmail(updatedData.email);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error(err);
        alert(`Update failed: ${err.message}`);
      } else {
        console.error("Error");
        alert(`Update failed: Error`);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  async function isUsernameAvailable() {
    if (!formData) return;
    try {
      const res = await fetch(
        `/api/register/society?username=${formData.username}`,
      );
      const data = await res.json();

      if (data.usernameExists) {
        setUsernameAvailable(false);
        setUsernameAlreadyTaken(true);
      } else {
        setUsernameAlreadyTaken(false);
        setUsernameAvailable(true);
      }
    } catch (error) {
      console.error("Error checking username:", error);
    }
  }
  const [isConfirmDelete, setIsConfirmDelete] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (isConfirmDelete) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isConfirmDelete]);
  return (
    <>
      {
        <>
          <Header />
          <main className="w-[95%] min-h-[85vh] lg:w-full max-w-6xl mx-auto py-10 md:py-16 px-4">
            <h2 className="text-4xl md:text-5xl font-extrabold text-center text-gray-900 mb-12">
              Manage Your Society Account
            </h2>
            <div className="flex justify-center items-center gap-4 pb-10 font-medium">
              <button
                onClick={() => {
                  setIsPreview(false);
                  setIsEdit(true);
                  setFormData(societyData);
                  setLogoPreview(societyData?.logo || null);
                }}
                className={`px-5 md:text-lg py-1 rounded-md border transition duration-300 hover:cursor-pointer ${
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
                  setUsernameAlreadyTaken(false);
                  setUsernameAvailable(false);
                  setSuccess(false);
                }}
                className={`px-5 md:text-lg py-1 rounded-md border transition duration-300 hover:cursor-pointer ${
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
                    className="mx-auto w-32 h-32 object-cover rounded-full border-2 border-indigo-700 shadow"
                  />
                  <h3 className="text-3xl font-bold mt-4">
                    {societyData?.name}
                  </h3>
                  <p className="text-gray-600 text-lg">
                    @{societyData?.username}
                  </p>
                  <p className="text-indigo-600 text-lg">
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      href={
                        societyData?.website?.startsWith("http")
                          ? societyData.website
                          : `https://${societyData?.website}`
                      }
                    >
                      {societyData?.website?.replace(/^https?:\/\//, "")}
                    </a>
                  </p>
                  <p className="text-gray-700 mt-2">{societyData?.type}</p>
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
                  <p className="text-sm font-medium">
                    Centralized Society:&nbsp;
                    <span
                      className={
                        societyData?.centralized
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    >
                      {societyData?.centralized ? "Yes" : "No"}
                    </span>
                  </p>
                </section>

                <section>
                  <h4 className="flex-1 items-center">
                    <span className="font-semibold text-2xl">
                      Faculty Coordinator:
                    </span>
                    &nbsp;
                    <span className="text-xl">
                      {societyData?.facultyCoordinator}
                    </span>
                  </h4>
                  <div className="md:text-lg"></div>
                </section>

                <section>
                  <h4 className="flex items-center text-2xl font-semibold mb-4">
                    About
                  </h4>
                  <div className="md:text-lg">{societyData?.about}</div>
                </section>

                <section>
                  <h4 className="flex items-center text-2xl font-semibold mb-4">
                    Team Members&nbsp;
                    <svg
                      className="hover:cursor-pointer"
                      onClick={() => router.push("/Account/Team")}
                      xmlns="http://www.w3.org/2000/svg"
                      height="24px"
                      viewBox="0 -960 960 960"
                      width="24px"
                      fill="#000000"
                    >
                      <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h560v-280h80v280q0 33-23.5 56.5T760-120H200Zm188-212-56-56 372-372H560v-80h280v280h-80v-144L388-332Z" />
                    </svg>
                  </h4>
                  {societyData?.team.length || 0 > 0 ? (
                    <div className="grid md:grid-cols-2 gap-6">
                      {societyData?.team?.map(
                        (member: TeamMember, index: number) => (
                          <div
                            key={index}
                            className="bg-white border border-gray-200 rounded-xl shadow-md p-6 transition-all hover:shadow-xl"
                          >
                            <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                              {member.name}
                            </h3>
                            <p className="text-base text-gray-600 mb-1">
                              <span className="font-medium">
                                Designation:&nbsp;
                              </span>
                              {member.designation}
                            </p>
                            <p className="text-base text-gray-600 mb-1">
                              <span className="font-medium">Mobile:</span>&nbsp;
                              {member.mobile}
                            </p>
                            <p className="text-base text-gray-600">
                              <span className="font-medium">Email:</span>&nbsp;
                              {member.email}
                            </p>
                          </div>
                        ),
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">
                      No team members added yet!
                    </p>
                  )}
                </section>

                <section>
                  <h4 className="text-2xl flex items-center font-semibold mb-4">
                    Events&nbsp;
                    <svg
                      className="hover:cursor-pointer"
                      onClick={() => router.push("/Account/Events")}
                      xmlns="http://www.w3.org/2000/svg"
                      height="24px"
                      viewBox="0 -960 960 960"
                      width="24px"
                      fill="#000000"
                    >
                      <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h560v-280h80v280q0 33-23.5 56.5T760-120H200Zm188-212-56-56 372-372H560v-80h280v280h-80v-144L388-332Z" />
                    </svg>
                  </h4>
                  {societyData?.events?.length || 0 > 0 ? (
                    (() => {
                      const now = new Date();
                      const events = societyData?.events ?? [];

                      const ongoing = events?.filter((event: Event) => {
                        const start = new Date(event.startDate);
                        const end = event.endDate
                          ? new Date(event.endDate)
                          : start;
                        return now >= start && now <= end;
                      });

                      const upcoming = events?.filter((event: Event) => {
                        const start = new Date(event.startDate);
                        return start > now;
                      });

                      const past = events?.filter((event: Event) => {
                        const end = event.endDate
                          ? new Date(event.endDate)
                          : new Date(event.startDate);
                        return end < now;
                      });

                      const renderEvents = (label: string, list: Event[]) =>
                        list.length > 0 && (
                          <>
                            <h5 className="text-xl font-semibold text-indigo-700 mt-6 mb-2">
                              {label}
                            </h5>
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                              {list.map((event: Event) => (
                                <div
                                  key={event._id}
                                  className="bg-white border border-gray-200 rounded-xl shadow-md p-6"
                                >
                                  <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                                    {event.title}
                                  </h3>
                                  {event.type && (
                                    <p className="text-base text-gray-600 mb-1">
                                      <strong>Type:</strong> {event.type}
                                    </p>
                                  )}
                                  <p className="text-base text-gray-600 mb-1">
                                    <strong>Venue:</strong> {event.venue}
                                  </p>
                                  <p className="text-base text-gray-600 mb-1">
                                    <strong>Time:</strong> {event.time}
                                  </p>
                                  {event.endDate &&
                                  event.endDate !== event.startDate ? (
                                    <>
                                      <p className="text-base text-gray-600 mb-1">
                                        <strong>Start:</strong>&nbsp;
                                        {new Date(
                                          event.startDate,
                                        ).toLocaleDateString("en-IN")}
                                      </p>
                                      <p className="text-base text-gray-600 mb-1">
                                        <strong>End:</strong>&nbsp;
                                        {new Date(
                                          event.endDate,
                                        ).toLocaleDateString("en-IN")}
                                      </p>
                                    </>
                                  ) : (
                                    <p className="text-base text-gray-600 mb-1">
                                      <strong>Date:</strong>&nbsp;
                                      {new Date(
                                        event.startDate,
                                      ).toLocaleDateString("en-IN")}
                                    </p>
                                  )}
                                  <p className="text-base text-gray-600 mb-1 whitespace-pre-wrap">
                                    <strong>About:</strong> {event.about}
                                  </p>
                                  {event.socialGroup && (
                                    <p className="text-indigo-600 text-sm mt-2 break-all">
                                      <a
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        href={
                                          event.socialGroup.startsWith("http")
                                            ? event.socialGroup
                                            : `https://${event.socialGroup}`
                                        }
                                      >
                                        {event.socialGroup.replace(
                                          /^https?:\/\//,
                                          "",
                                        )}
                                      </a>
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </>
                        );

                      return (
                        <>
                          {renderEvents("Ongoing Events", ongoing)}
                          {renderEvents("Upcoming Events", upcoming)}
                          {renderEvents("Past Events", past)}
                        </>
                      );
                    })()
                  ) : (
                    <p className="text-gray-500 italic">
                      No scheduled events right now. Stay tuned!
                    </p>
                  )}
                </section>

                <section>
                  <h4 className="text-2xl font-semibold mb-4">Social Links</h4>
                  <ul className="space-y-2">
                    {societyData?.social?.map((s: SocialLink, i: number) => {
                      const icon = s.name === "LinkedIn" ? linkedin : instagram;
                      const handleUrl = s.handle.startsWith("http")
                        ? s.handle
                        : `https://${s.handle}`;
                      const username = s.handle
                        .replace(/\/+$/, "")
                        .split("/")
                        .pop();
                      return (
                        <li
                          key={i}
                          className="flex items-center gap-2 md:gap-3"
                        >
                          <Image
                            src={icon}
                            width={24}
                            height={24}
                            alt={`${s.name} icon`}
                          />
                          <span className="font-medium">{s.name}:</span>
                          <a
                            className="text-blue-600 underline break-all"
                            href={handleUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            @{username}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </section>

                <section className="mt-8">
                  <h4 className="text-2xl font-semibold mb-4">
                    Eligibility Criteria
                  </h4>
                  {societyData?.eligibility?.length || 0 > 0 ? (
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      {societyData?.eligibility.map(
                        (e: EligibilityCriterion, i: number) => (
                          <li key={i}>{e.name}</li>
                        ),
                      )}
                    </ul>
                  ) : (
                    <p className="text-gray-500 italic">
                      No specific eligibility criteria mentioned.
                    </p>
                  )}
                </section>
              </div>
            ) : (
              <div className="space-y-10 text-base md:text-lg">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleUpdate();
                  }}
                  className="space-y-8"
                >
                  <section className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
                    <h3 className="text-2xl font-bold mb-4 text-center text-gray-800">
                      Edit Society Info
                    </h3>
                    <div className="grid gap-6">
                      <div>
                        <label className="block font-medium mb-1 text-gray-700">
                          Society Logo
                        </label>
                        <div className="flex flex-col sm:flex-row items-center gap-4 mt-2">
                          {logoPreview && (
                            <img
                              src={logoPreview}
                              alt="Logo Preview"
                              className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-full border-2 border-indigo-700"
                            />
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoChange}
                            className="mt-2 sm:mt-0 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block font-medium mb-1 text-gray-700">
                          Society Name
                        </label>
                        <input
                          type="text"
                          value={formData?.name || ""}
                          onChange={(e) =>
                            setFormData(
                              formData
                                ? { ...formData, name: e.target.value }
                                : null,
                            )
                          }
                          placeholder="Enter society name"
                          className="w-full max-w-full border border-gray-300 px-3 py-2 sm:px-4 sm:py-2 rounded-md focus:outline-none focus:ring focus:ring-indigo-200 box-border"
                        />
                      </div>
                      <div>
                        <label className="block font-medium mb-1 text-gray-700">
                          Website
                        </label>
                        <input
                          type="text"
                          value={formData?.website || ""}
                          onChange={(e) =>
                            setFormData(
                              formData
                                ? { ...formData, website: e.target.value }
                                : null,
                            )
                          }
                          placeholder="Enter website"
                          className="w-full max-w-full border border-gray-300 px-3 py-2 sm:px-4 sm:py-2 rounded-md focus:outline-none focus:ring focus:ring-indigo-200 box-border"
                        />
                      </div>
                      <div>
                        <label className="block font-medium mb-1 text-gray-700">
                          Username
                        </label>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            type="text"
                            value={formData?.username || ""}
                            onChange={(e) => {
                              setFormData(
                                formData
                                  ? { ...formData, username: e.target.value }
                                  : null,
                              );
                              setUsernameAlreadyTaken(false);
                              setUsernameAvailable(false);
                            }}
                            placeholder="Enter username"
                            className="w-full max-w-full border border-gray-300 px-3 py-2 sm:px-4 sm:py-2 rounded-md focus:outline-none focus:ring focus:ring-indigo-200 box-border"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              isUsernameAvailable();
                            }}
                            className="w-full sm:w-auto px-4 py-2 text-center rounded-md bg-indigo-500 hover:bg-indigo-700 text-white font-medium transition-colors hover:cursor-pointer"
                          >
                            Check
                          </button>
                        </div>
                        {usernameAvailable && (
                          <span className="block text-green-700 text-sm mt-1">
                            Username Available
                          </span>
                        )}
                        {usernameAlreadyTaken && (
                          <span className="block text-red-700 text-sm mt-1">
                            Username Already Taken
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                        <label className="text-gray-700 font-medium whitespace-nowrap">
                          Category:
                        </label>
                        <select
                          value={formData?.type}
                          onChange={(e) =>
                            setFormData(
                              formData
                                ? { ...formData, type: e.target.value }
                                : null,
                            )
                          }
                          className="w-full sm:w-auto px-3 py-2 border-b font-bold border-gray-300 focus:outline-none focus:ring focus:ring-indigo-200"
                        >
                          <option>Academic & Technical</option>
                          <option>Cultural & Arts</option>
                          <option>Social & Service</option>
                          <option>Sports & Fitness</option>
                          <option>Gaming</option>
                          <option>Leadership & Communication</option>
                          <option>Misc / Special Interest</option>
                          <option>Others</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-medium mb-1 text-gray-700">
                          Faculty Coordinator
                        </label>
                        <input
                          value={formData?.facultyCoordinator || ""}
                          onChange={(e) =>
                            setFormData(
                              formData
                                ? {
                                    ...formData,
                                    facultyCoordinator: e.target.value,
                                  }
                                : null,
                            )
                          }
                          placeholder="Who's your faculty coordinator?"
                          className="w-full max-w-full border border-gray-300 px-3 py-2 sm:px-4 sm:py-2 rounded-md focus:outline-none focus:ring focus:ring-indigo-200 box-border"
                        />
                      </div>
                      <div>
                        <label className="block font-medium mb-1 text-gray-700">
                          About
                        </label>
                        <textarea
                          rows={4}
                          value={formData?.about || ""}
                          onChange={(e) =>
                            setFormData(
                              formData
                                ? { ...formData, about: e.target.value }
                                : null,
                            )
                          }
                          placeholder="Tell us about your society"
                          className="w-full max-w-full border border-gray-300 px-3 py-2 sm:px-4 sm:py-2 rounded-md focus:outline-none focus:ring focus:ring-indigo-200 box-border"
                        />
                      </div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                        <label className="text-gray-700 font-medium whitespace-nowrap">
                          Auditions:
                        </label>
                        <select
                          value={formData?.auditionOpen ? "true" : "false"}
                          onChange={(e) =>
                            setFormData(
                              formData
                                ? {
                                    ...formData,
                                    auditionOpen: e.target.value === "true",
                                  }
                                : null,
                            )
                          }
                          className="w-full sm:w-auto px-3 py-2 border-b border-gray-300 font-bold focus:outline-none focus:ring-indigo-200"
                        >
                          <option value="true">Open</option>
                          <option value="false">Closed</option>
                        </select>
                      </div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                        <label className="text-gray-700 font-medium whitespace-nowrap">
                          Centralized Society:
                        </label>
                        <select
                          value={formData?.centralized ? "true" : "false"}
                          onChange={(e) =>
                            setFormData(
                              formData
                                ? {
                                    ...formData,
                                    centralized: e.target.value === "true",
                                  }
                                : null,
                            )
                          }
                          className="w-full sm:w-auto px-3 py-2 border-b border-gray-300 font-bold focus:outline-none focus:ring-indigo-200"
                        >
                          <option value="true">Yes</option>
                          <option value="false">No</option>
                        </select>
                      </div>
                    </div>
                  </section>
                  <section className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
                    <h3 className="text-2xl font-semibold mb-4 text-center text-gray-800">
                      Social Links
                    </h3>
                    <div className="space-y-4">
                      {formData?.social?.map((s: SocialLink, idx: number) => (
                        <div
                          key={idx}
                          className="flex flex-col sm:flex-row gap-2 items-start sm:items-center shadow-md rounded-lg p-3"
                        >
                          <select
                            value={s.name}
                            onChange={(e) =>
                              handleSocialChange(idx, "name", e.target.value)
                            }
                            className="w-full sm:w-1/3 px-2 py-2 border-b border-gray-300 focus:outline-none focus:ring-indigo-200"
                          >
                            <option value="LinkedIn">LinkedIn</option>
                            <option value="Instagram">Instagram</option>
                          </select>
                          <input
                            type="text"
                            value={s.handle}
                            onChange={(e) =>
                              handleSocialChange(idx, "handle", e.target.value)
                            }
                            placeholder="Profile URL"
                            className="w-full max-w-full border-b border-gray-300 px-3 py-2 sm:px-4 sm:py-2 focus:outline-none box-border"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveSocial(idx)}
                            className="w-full sm:w-auto px-4 py-2 text-red-500 font-medium rounded-md hover:bg-red-50 transition-colors sm:self-center hover:cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={handleAddSocial}
                        className="mt-2 text-indigo-600 hover:text-indigo-800 font-medium hover:underline transition-colors hover:cursor-pointer"
                      >
                        + Add Social Link
                      </button>
                    </div>
                  </section>
                  <section className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
                    <h3 className="text-2xl font-semibold mb-4 text-center text-gray-800">
                      Eligibility Criteria
                    </h3>
                    <div className="space-y-4">
                      {formData?.eligibility?.map(
                        (e: EligibilityCriterion, idx: number) => (
                          <div
                            key={idx}
                            className="flex flex-col sm:flex-row gap-2 items-start sm:items-center shadow-md rounded-lg p-3"
                          >
                            <input
                              type="text"
                              value={e.name}
                              onChange={(ev) =>
                                handleEligibilityChange(idx, ev.target.value)
                              }
                              placeholder="e.g., Must be a student of the college"
                              className="w-full max-w-full border-b border-gray-300 px-3 py-2 sm:px-4 sm:py-2 focus:outline-none focus:ring-indigo-200 box-border"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveEligibility(idx)}
                              className="w-full sm:w-auto px-4 py-2 text-red-500 font-medium rounded-md hover:bg-red-50 transition-colors sm:self-center hover:cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        ),
                      )}
                      <button
                        type="button"
                        onClick={handleAddEligibility}
                        className="mt-2 text-indigo-600 hover:text-indigo-800 font-medium hover:underline transition-colors hover:cursor-pointer"
                      >
                        + Add Eligibility Criterion
                      </button>
                    </div>
                  </section>
                  <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <button
                      type="submit"
                      disabled={isUpdating}
                      className={`w-full sm:w-auto px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-semibold transition-colors disabled:bg-indigo-300 disabled:cursor-not-allowed ${
                        isUpdating || success
                          ? "opacity-50"
                          : "hover:cursor-pointer"
                      }`}
                    >
                      {isUpdating
                        ? "Saving..."
                        : success
                          ? "Saved"
                          : "Save Changes"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEdit(false);
                        setIsPreview(true);
                        setFormData(societyData);
                        setLogoFile(null);
                      }}
                      className="w-full sm:w-auto px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md font-semibold transition-colors hover:cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </main>
          <div className="w-[90%] lg:w-[80%] m-auto border-t-2 border-red-600 pt-2 md:pt-5 pb-5">
            <div className="text-xl text-red-600 font-bold">
              <button
                onClick={() => setIsConfirmDelete(true)}
                className="hover:cursor-pointer"
              >
                Delete your account
              </button>
            </div>
          </div>
        </>
      }

      {isConfirmDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center transition-opacity duration-300">
          <div className="modal-content bg-[#1f1e1e] border-1 text-white p-6 rounded-lg shadow-xl w-[95%] md:w-full max-w-md border border-gray-700">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-bold text-white">
                Are you absolutely sure?
              </h2>
              <p className="hover:cursor-pointer">
                <svg
                  onClick={() => {
                    setIsConfirmDelete(false);
                    setInputValue("");
                  }}
                  xmlns="http://www.w3.org/2000/svg"
                  height="24px"
                  viewBox="0 -960 960 960"
                  width="24px"
                  fill="#ffffff"
                >
                  <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
                </svg>
              </p>
            </div>
            <p className="text-gray-100 mb-4">
              This action cannot be undone. This will permanently delete
              the&nbsp;
              <strong className="text-white">{societyData?.name}</strong>&nbsp;
              organization from Cleit.
            </p>

            <div className="my-2">
              <label className="text-gray-100 block mb-1">
                Please type the following to confirm:
              </label>
              <p className="text-black font-bold bg-white px-3 py-0.5 mb-2 rounded-full">{`cleit.in/org/${societyData?.username}`}</p>
              <input
                type="text"
                value={inputValue}
                autoFocus
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full bg-[#141414] text-sm md:text-base text-white px-3 py-1 rounded-lg border-2 border-red-500 focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none transition-colors"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
              />
            </div>
            <div className="mb-5">
              <div className="flex items-center">
                <label className="text-gray-100 block mb-1">
                  Account Password&nbsp;
                </label>
                <svg
                  onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                  xmlns="http://www.w3.org/2000/svg"
                  height="22px"
                  viewBox="0 -960 960 960"
                  width="22px"
                  fill="#ffffff"
                >
                  <path
                    d={`${isPasswordVisible ? "M480-320q75 0 127.5-52.5T660-500q0-75-52.5-127.5T480-680q-75 0-127.5 52.5T300-500q0 75 52.5 127.5T480-320Zm0-72q-45 0-76.5-31.5T372-500q0-45 31.5-76.5T480-608q45 0 76.5 31.5T588-500q0 45-31.5 76.5T480-392Zm0 192q-146 0-266-81.5T40-500q54-137 174-218.5T480-800q146 0 266 81.5T920-500q-54 137-174 218.5T480-200Zm0-300Zm0 220q113 0 207.5-59.5T832-500q-50-101-144.5-160.5T480-720q-113 0-207.5 59.5T128-500q50 101 144.5 160.5T480-280Z" : "m644-428-58-58q9-47-27-88t-93-32l-58-58q17-8 34.5-12t37.5-4q75 0 127.5 52.5T660-500q0 20-4 37.5T644-428Zm128 126-58-56q38-29 67.5-63.5T832-500q-50-101-143.5-160.5T480-720q-29 0-57 4t-55 12l-62-62q41-17 84-25.5t90-8.5q151 0 269 83.5T920-500q-23 59-60.5 109.5T772-302Zm20 246L624-222q-35 11-70.5 16.5T480-200q-151 0-269-83.5T40-500q21-53 53-98.5t73-81.5L56-792l56-56 736 736-56 56ZM222-624q-29 26-53 57t-41 67q50 101 143.5 160.5T480-280q20 0 39-2.5t39-5.5l-36-38q-11 3-21 4.5t-21 1.5q-75 0-127.5-52.5T300-500q0-11 1.5-21t4.5-21l-84-82Zm319 93Zm-151 75Z"}`}
                  />
                </svg>
              </div>
              <input
                type={isPasswordVisible ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#141414] text-sm md:text-base text-white px-3 py-1 rounded-lg border-2 border-red-500 focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none transition-colors"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
              />
            </div>

            <div className="modal-actions flex justify-end gap-4">
              <button
                className={`btn w-full delete-btn px-4 py-2 rounded-lg font-semibold transition-all duration-200 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer bg-red-600 hover:bg-red-700 ${
                  deletePending ||
                  deleteSuccess ||
                  inputValue !== `cleit.in/org/${societyData?.username}` ||
                  password == "opacity-50"
                    ? ""
                    : ""
                }`}
                disabled={
                  inputValue !== `cleit.in/org/${societyData?.username}` ||
                  password == "" ||
                  deletePending ||
                  deleteSuccess
                }
                onClick={handleDelete}
              >
                {deletePending
                  ? "Deleting..."
                  : deleteSuccess
                    ? "Account Deleted"
                    : "Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
