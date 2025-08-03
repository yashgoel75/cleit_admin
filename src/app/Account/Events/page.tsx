"use client";

import "../page.css";
import Header from "../../Header/page";
import Footer from "@/app/Footer/page";
import { useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getFirebaseToken } from "@/utils";

export default function Events() {
  interface EventData {
    _id: string;
    title: string;
    type?: string;
    startDate: string;
    endDate?: string;
    venue: string;
    time: string;
    about: string;
    socialGroup?: string;
  }

  type EventFormFields = {
    [K in keyof Omit<EventData, "_id">]: string;
  };

  const formFields = [
    { name: "title", label: "Event Title", type: "text" },
    {
      name: "type",
      label: "Event Type (Audition, Competition, etc.)",
      type: "text",
    },
    { name: "startDate", label: "Start Date", type: "date" },
    {
      name: "endDate",
      label: "End Date (optional, for multi-day events)",
      type: "date",
    },
    { name: "venue", label: "Venue", type: "text" },
    { name: "time", label: "Time", type: "time" },
    { name: "about", label: "About the Event", elementType: "textarea" },
    {
      name: "socialGroup",
      label: "WhatsApp Group Link (optional)",
      type: "text",
    },
  ];

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [events, setEvents] = useState<EventData[]>([]);

  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initialFormState = {
    title: "",
    type: "",
    startDate: "",
    endDate: "",
    venue: "",
    time: "",
    about: "",
    socialGroup: "",
  };
  const [eventFormData, setEventFormData] =
    useState<EventFormFields>(initialFormState);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);

  const getSocietyByEmail = async (email: string | null | undefined) => {
    try {
      const res = await fetch(
        `/api/society/team?email=${encodeURIComponent(email || "")}`,
      );
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || "Failed to fetch society data");
      setEvents(data.society.events || []);
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
      setCurrentUser(user);
      if (user) {
        getSocietyByEmail(user.email);
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleEventSubmit = async () => {
    if (!currentUser) return;

    const body = editingEventId
      ? {
          societyEmail: currentUser.email,
          eventId: editingEventId,
          updates: eventFormData,
        }
      : {
          societyEmail: currentUser.email,
          newEvent: eventFormData,
        };

    const method = editingEventId ? "PATCH" : "POST";
    const token = await getFirebaseToken();
    const res = await fetch("/api/society/events", {
      method,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
       },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      setEventFormData(initialFormState);
      setEditingEventId(null);
      setIsFormVisible(false);
      getSocietyByEmail(currentUser.email);
    }
  };

  const handleEditEvent = (event: EventData) => {
    setEventFormData({
      title: event.title || "",
      type: event.type || "",
      startDate: event.startDate
        ? new Date(event.startDate).toISOString().split("T")[0]
        : "",
      endDate: event.endDate
        ? new Date(event.endDate).toISOString().split("T")[0]
        : "",
      venue: event.venue || "",
      time: event.time || "",
      about: event.about || "",
      socialGroup: event.socialGroup || "",
    });
    setEditingEventId(event._id);
    setIsFormVisible(true);
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!currentUser) return;
    const token = await getFirebaseToken();
    const res = await fetch("/api/society/events", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
       },
      body: JSON.stringify({
        societyEmail: currentUser.email,
        eventId,
      }),
    });

    if (res.ok) {
      getSocietyByEmail(currentUser.email);
    }
  };

  return (
    <>
      <Header />
      <main className="w-[95%] min-h-[85vh] lg:w-full max-w-6xl mx-auto py-10 md:py-16 px-4 onest-normal">
        <h2 className="text-4xl md:text-5xl font-extrabold text-center text-gray-900 mb-12">
          Manage Your Events
        </h2>

        <div className="flex justify-center mb-8">
          <button
            onClick={() => {
              setEditingEventId(null);
              setEventFormData(initialFormState);
              setIsFormVisible(true);
            }}
            className="bg-indigo-500 hover:bg-indigo-700 text-white px-6 py-2 rounded-md font-medium transition hover:cursor-pointer"
          >
            + Add Event
          </button>
        </div>

        {isFormVisible && (
          <div className="mb-10 bg-gray-50 p-6 rounded-lg shadow-md max-w-xl mx-auto">
            <h3 className="text-xl font-semibold mb-6 text-center">
              {editingEventId ? "Edit Event" : "Add New Event"}
            </h3>
            <div className="grid grid-cols-1 gap-y-6">
              {formFields.map((field) => (
                <div key={field.name}>
                  <label
                    htmlFor={field.name}
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    {field.label}
                  </label>
                  {field.elementType === "textarea" ? (
                    <textarea
                      id={field.name}
                      name={field.name}
                      rows={4}
                      value={eventFormData[field.name as keyof EventFormFields]}
                      onChange={(e) =>
                        setEventFormData({
                          ...eventFormData,
                          [field.name]: e.target.value,
                        })
                      }
                      className="p-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  ) : (
                    <input
                      id={field.name}
                      name={field.name}
                      type={field.type}
                      value={eventFormData[field.name as keyof EventFormFields]}
                      onChange={(e) =>
                        setEventFormData({
                          ...eventFormData,
                          [field.name]: e.target.value,
                        })
                      }
                      className="p-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-4 justify-center mt-8">
              <button
                onClick={handleEventSubmit}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md transition hover:cursor-pointer"
              >
                {editingEventId ? "Update Event" : "Add Event"}
              </button>
              <button
                onClick={() => setIsFormVisible(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-5 py-2 rounded-md transition hover:cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <p className="text-center text-gray-600">Loading events...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : events.length === 0 ? (
          <p className="text-center text-gray-600">No events found.</p>
        ) : (
          <section
            className={`grid gap-6 sm:grid-cols-2 ${
              events.length === 1
                ? "lg:grid-cols-1"
                : events.length === 2
                  ? "lg:grid-cols-2"
                  : "lg:grid-cols-3"
            }`}
          >
            {events.map((event: EventData) => (
              <div
                key={event._id}
                className="bg-white border border-gray-200 rounded-xl shadow-md p-6 transition-all hover:shadow-xl flex flex-col"
              >
                <div className="flex-grow">
                  <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                    {event.title}
                  </h3>
                  {event.type && (
                    <p className="text-base text-gray-600 mb-1">
                      <span className="font-medium">Type:</span> {event.type}
                    </p>
                  )}
                  <p className="text-base text-gray-600 mb-1">
                    <span className="font-medium">Venue:</span> {event.venue}
                  </p>
                  <p className="text-base text-gray-600 mb-1">
                    <span className="font-medium">Time:</span> {event.time}
                  </p>
                  {event.endDate && event.endDate !== event.startDate ? (
                    <>
                      <p className="text-base text-gray-600 mb-1">
                        <span className="font-medium">Start:</span>&nbsp;
                        {new Date(event.startDate).toLocaleDateString("en-IN")}
                      </p>
                      <p className="text-base text-gray-600 mb-1">
                        <span className="font-medium">End:</span>&nbsp;
                        {new Date(event.endDate).toLocaleDateString("en-IN")}
                      </p>
                    </>
                  ) : (
                    <p className="text-base text-gray-600 mb-1">
                      <span className="font-medium">Date:</span>&nbsp;
                      {new Date(event.startDate).toLocaleDateString("en-IN")}
                    </p>
                  )}
                  <p className="text-base text-gray-600 mb-1 whitespace-pre-wrap">
                    <span className="font-medium">About:</span> {event.about}
                  </p>
                  {event.socialGroup && (
                    <p className="text-indigo-600 text-sm mt-2 break-all">
                      <a
                        target="_blank"
                        rel="noopener noreferrer"
                        href={
                          event.socialGroup?.startsWith("http")
                            ? event.socialGroup
                            : `https://${event.socialGroup}`
                        }
                      >
                        {event.socialGroup.replace(/^https?:\/\//, "")}
                      </a>
                    </p>
                  )}
                </div>
                <div className="flex gap-4 mt-4 pt-4 border-t border-gray-300">
                  <button
                    onClick={() => handleEditEvent(event)}
                    className="text-blue-600 hover:underline text-sm hover:cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteEvent(event._id)}
                    className="text-red-600 hover:underline text-sm hover:cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
