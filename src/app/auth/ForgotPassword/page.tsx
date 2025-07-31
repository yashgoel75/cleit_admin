"use client";
import { useState, useEffect } from "react";
import logo from "@/assets/cleit.png";
import Image from "next/image";
import axios from "axios";
import { useRouter } from "next/navigation";
import "./page.css";
import Tooltip from "@/app/Tooltip/page";
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import Link from "next/link";
import Footer from "../Footer/page";
import { auth } from "../../../lib/firebase";

export default function Member() {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    password: "",
    confirmPassword: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [falseUsernameFormat, setFalseUsernameFormat] = useState(false);
  const [falseEmailFormat, setFalseEmailFormat] = useState(false);
  const [falsePasswordFormat, setFalsePasswordFormat] = useState(false);
  const [falseConfirmPassword, setFalseConfirmPassword] = useState(false);

  const [invalidOtp, setInvalidOtp] = useState(false);
  const [validOtp, setValidOtp] = useState(false);

  const [isEmailEmpty, setIsEmailEmpty] = useState(false);
  const [isOtpVerificationFailed, setIsOtpVerificationFailed] = useState(false);
  const [isPasswordEmpty, setIsPasswordEmpty] = useState(false);
  const [isConfirmPasswordEmpty, setIsConfirmPasswordEmpty] = useState(false);

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "email") {
      setIsEmailEmpty(false);
    }
    if (name == "password") {
      setIsPasswordEmpty(false);
    }
    if (name == "confirmPassword") {
      setIsConfirmPasswordEmpty(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      formData.email == "" ||
      formData.password == "" ||
      formData.confirmPassword == ""
    ) {
      setIsEmailEmpty(formData.email == "");
      setIsPasswordEmpty(formData.password == "");
      setIsConfirmPasswordEmpty(formData.confirmPassword == "");
      return;
    }
    if (invalidOtp || !validOtp) {
      setIsOtpVerificationFailed(true);
      return;
    }
    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      await sendPasswordResetEmail(auth, formData.email);
      const res = await fetch("/api/changepassword/member", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          newPassword: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      setSuccess("Password changed successfully!");
    } catch (err: any) {
      console.error("Password change error:", err);
      setError(err.message || "Failed to change password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  async function sendEmailOtp() {
    try {
      const res = await fetch(`/api/register/member?email=${formData.email}`);
      const data = await res.json();

      const otpRes = await fetch("/api/otp/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: formData.email }),
      });

      const otpData = await otpRes.json();
      if (!otpRes.ok) {
        console.error("OTP error:", otpData.error);
      }
    } catch (error) {
      console.log("Error checking email or sending OTP:", error);
    }
  }

  async function verifyOtp() {
    try {
      const res = await fetch("/api/otp/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: formData.email, otp: formData.otp }),
      });

      const data = await res.json();

      if (res.ok && data.verified) {
        setInvalidOtp(false);
        setValidOtp(true);
      } else {
        setValidOtp(false);
        setInvalidOtp(true);
      }
    } catch (e) {
      console.error(e);
    }
  }
  useEffect(() => {
    const { email, password, confirmPassword } = formData;

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    setFalseEmailFormat(email ? !emailRegex.test(email) : false);

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&])[A-Za-z\d@$!%*?#&]{8,}$/;
    setFalsePasswordFormat(password ? !passwordRegex.test(password) : false);

    setFalseConfirmPassword(
      !!confirmPassword && !!password && confirmPassword !== password,
    );
  }, [formData]);

  return (
    <>
      <div className="flex justify-center">
        <Image src={logo} width={isMobile ? 150 : 200} alt="cleit"></Image>
      </div>
      <div className="border-1 border-gray-200 mt-2"></div>
      <div className="w-[95%] md:w-[80%] lg:w-[60%] mx-auto pt-10">
        <div className="border md:text-lg border-gray-300 p-4 md:p-6 rounded-xl shadow-md bg-white mb-8">
          <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
            Forgot Password
          </h1>

          <form
            onSubmit={handleSubmit}
            className="space-y-1 md:space-y-2 lg:space-y-4"
          >
            <div>
              <label className="block mb-1 text-gray-700 font-medium">
                Email
              </label>
              <div className="flex items-center border border-gray-300 rounded-md">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="flex-1 px-4 py-2 outline-none w-[70%] lg:w-[80%]"
                />
                <button
                  type="button"
                  onClick={() => sendEmailOtp()}
                  className="bg-indigo-500 w-[30%] lg:w-[20%] outline-none text-white px-1 md:px-2 lg:px-4 md:px-2 lg:px-4 py-2 rounded-r-md hover:bg-indigo-700 hover:cursor-pointer"
                >
                  Send OTP
                </button>
              </div>
              {isEmailEmpty ? (
                <div className="text-sm flex text-[#8C1A10] mt-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="18px"
                    viewBox="0 -960 960 960"
                    width="18px"
                    fill="#8C1A10"
                  >
                    <path d="M480-280q17 0 28.5-11.5T520-320q0-17-11.5-28.5T480-360q-17 0-28.5 11.5T440-320q0 17 11.5 28.5T480-280Zm-40-160h80v-240h-80v240Zm40 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
                  </svg>
                  &nbsp; Please enter your email
                </div>
              ) : null}
            </div>
            {falseEmailFormat ? (
              <div className="flex text-sm md:text-base justify-center items-center bg-red-300 text-red-800 rounded px-3 text-center py-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height={isMobile ? "20px" : "24px"}
                  viewBox="0 -960 960 960"
                  width={isMobile ? "20px" : "24px"}
                  fill="#992B15"
                >
                  <path d="m40-120 440-760 440 760H40Zm138-80h604L480-720 178-200Zm302-40q17 0 28.5-11.5T520-280q0-17-11.5-28.5T480-320q-17 0-28.5 11.5T440-280q0 17 11.5 28.5T480-240Zm-40-120h80v-200h-80v200Zm40-100Z" />
                </svg>
                &nbsp; Please enter a valid email address
              </div>
            ) : null}
            <div>
              <label className="block mb-1 text-gray-700 font-medium">
                Enter OTP
              </label>
              <div className="flex items-center border border-gray-300 rounded-md">
                <input
                  type="text"
                  name="otp"
                  placeholder="123456"
                  value={formData.otp}
                  onChange={handleChange}
                  className="flex-1 px-4 py-2 outline-none w-[70%] lg:w-[80%]"
                />
                <button
                  type="button"
                  onClick={verifyOtp}
                  disabled={validOtp}
                  className={`bg-indigo-500 outline-none w-[30%] lg:w-[20%] text-white px-1 md:px-2 lg:px-4 py-2 rounded-r-md hover:bg-indigo-700 hover:cursor-pointer ${
                    validOtp
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:cursor-pointer"
                  }`}
                >
                  Verify
                </button>
              </div>
              {isOtpVerificationFailed ? (
                <div className="text-sm flex text-[#8C1A10] mt-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="18px"
                    viewBox="0 -960 960 960"
                    width="18px"
                    fill="#8C1A10"
                  >
                    <path d="M480-280q17 0 28.5-11.5T520-320q0-17-11.5-28.5T480-360q-17 0-28.5 11.5T440-320q0 17 11.5 28.5T480-280Zm-40-160h80v-240h-80v240Zm40 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
                  </svg>
                  &nbsp; Please verify your Email ID
                </div>
              ) : null}
            </div>

            {invalidOtp ? (
              <div className="flex text-sm md:text-base justify-center md:items-center bg-red-300 text-red-800 rounded px-3 text-center py-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height={isMobile ? "20px" : "24px"}
                  viewBox="0 -960 960 960"
                  width={isMobile ? "20px" : "24px"}
                  fill="#992B15"
                >
                  <path d="m40-120 440-760 440 760H40Zm138-80h604L480-720 178-200Zm302-40q17 0 28.5-11.5T520-280q0-17-11.5-28.5T480-320q-17 0-28.5 11.5T440-280q0 17 11.5 28.5T480-240Zm-40-120h80v-200h-80v200Zm40-100Z" />
                </svg>
                &nbsp; The entered OTP is invalid. Kindly verify and re-enter.
              </div>
            ) : null}
            {validOtp ? (
              <div className="flex text-sm md:text-base justify-center items-center bg-green-500 text-[#264d0fff] rounded px-3 text-center py-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24px"
                  viewBox="0 -960 960 960"
                  width="24px"
                  fill="#264d0fff"
                >
                  <path d="m344-60-76-128-144-32 14-148-98-112 98-112-14-148 144-32 76-128 136 58 136-58 76 128 144 32-14 148 98 112-98 112 14 148-144 32-76 128-136-58-136 58Zm34-102 102-44 104 44 56-96 110-26-10-112 74-84-74-86 10-112-110-24-58-96-102 44-104-44-56 96-110 24 10 112-74 86 74 84-10 114 110 24 58 96Zm102-318Zm-42 142 226-226-56-58-170 170-86-84-56 56 142 142Z" />
                </svg>
                &nbsp; OTP verified successfully
              </div>
            ) : null}
            <div className="flex-1 space-y-1 md:flex gap-4">
              <div className="flex-1">
                <div>
                  <div className="flex items-center">
                    <div className="mr-1">
                      <label className="block mb-1 text-gray-700 font-medium">
                        New Password
                      </label>
                    </div>
                    <div>
                      <Tooltip
                        content="Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character (e.g., @, #, $, !, %, *, ?, &)."
                        position="top"
                      >
                        <svg
                          className="mr-2"
                          xmlns="http://www.w3.org/2000/svg"
                          height="18px"
                          viewBox="0 -960 960 960"
                          width="18px"
                          fill="#141414"
                        >
                          <path d="M440-280h80v-240h-80v240Zm40-320q17 0 28.5-11.5T520-640q0-17-11.5-28.5T480-680q-17 0-28.5 11.5T440-640q0 17 11.5 28.5T480-600Zm0 520q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
                        </svg>
                      </Tooltip>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
                    />
                  </div>
                </div>
                {isPasswordEmpty ? (
                  <div className="text-sm flex text-[#8C1A10] mt-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="18px"
                      viewBox="0 -960 960 960"
                      width="18px"
                      fill="#8C1A10"
                    >
                      <path d="M480-280q17 0 28.5-11.5T520-320q0-17-11.5-28.5T480-360q-17 0-28.5 11.5T440-320q0 17 11.5 28.5T480-280Zm-40-160h80v-240h-80v240Zm40 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
                    </svg>
                    &nbsp; Please enter password
                  </div>
                ) : null}
              </div>

              <div className="flex-1">
                <div>
                  <div className="flex items-center">
                    <label className="block mb-1 text-gray-700 font-medium">
                      Confirm New Password&nbsp;
                    </label>
                    <svg
                      onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                      xmlns="http://www.w3.org/2000/svg"
                      height="20px"
                      viewBox="0 -960 960 960"
                      width="20px"
                      fill="#000000"
                    >
                      <path
                        d={
                          isPasswordVisible
                            ? "M480-320q75 0 127.5-52.5T660-500q0-75-52.5-127.5T480-680q-75 0-127.5 52.5T300-500q0 75 52.5 127.5T480-320Zm0-72q-45 0-76.5-31.5T372-500q0-45 31.5-76.5T480-608q45 0 76.5 31.5T588-500q0 45-31.5 76.5T480-392Zm0 192q-146 0-266-81.5T40-500q54-137 174-218.5T480-800q146 0 266 81.5T920-500q-54 137-174 218.5T480-200Zm0-300Zm0 220q113 0 207.5-59.5T832-500q-50-101-144.5-160.5T480-720q-113 0-207.5 59.5T128-500q50 101 144.5 160.5T480-280Z"
                            : "m644-428-58-58q9-47-27-88t-93-32l-58-58q17-8 34.5-12t37.5-4q75 0 127.5 52.5T660-500q0 20-4 37.5T644-428Zm128 126-58-56q38-29 67.5-63.5T832-500q-50-101-143.5-160.5T480-720q-29 0-57 4t-55 12l-62-62q41-17 84-25.5t90-8.5q151 0 269 83.5T920-500q-23 59-60.5 109.5T772-302Zm20 246L624-222q-35 11-70.5 16.5T480-200q-151 0-269-83.5T40-500q21-53 53-98.5t73-81.5L56-792l56-56 736 736-56 56ZM222-624q-29 26-53 57t-41 67q50 101 143.5 160.5T480-280q20 0 39-2.5t39-5.5l-36-38q-11 3-21 4.5t-21 1.5q-75 0-127.5-52.5T300-500q0-11 1.5-21t4.5-21l-84-82Zm319 93Zm-151 75Z"
                        }
                      />
                    </svg>
                  </div>
                  <input
                    type={isPasswordVisible ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="superstrongpassword"
                    className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
                  />
                </div>
                {isConfirmPasswordEmpty ? (
                  <div className="text-sm flex text-[#8C1A10] mt-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="18px"
                      viewBox="0 -960 960 960"
                      width="18px"
                      fill="#8C1A10"
                    >
                      <path d="M480-280q17 0 28.5-11.5T520-320q0-17-11.5-28.5T480-360q-17 0-28.5 11.5T440-320q0 17 11.5 28.5T480-280Zm-40-160h80v-240h-80v240Zm40 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
                    </svg>
                    &nbsp; Please enter confirm password
                  </div>
                ) : null}
              </div>
            </div>
            {falsePasswordFormat ? (
              <div className="flex text-sm md:text-base justify-center md:items-center bg-red-300 text-red-800 rounded px-3 text-center py-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height={isMobile ? "20px" : "24px"}
                  viewBox="0 -960 960 960"
                  width={isMobile ? "20px" : "24px"}
                  fill="#992B15"
                >
                  <path d="m40-120 440-760 440 760H40Zm138-80h604L480-720 178-200Zm302-40q17 0 28.5-11.5T520-280q0-17-11.5-28.5T480-320q-17 0-28.5 11.5T440-280q0 17 11.5 28.5T480-240Zm-40-120h80v-200h-80v200Zm40-100Z" />
                </svg>
                &nbsp; Please enter a valid password format
              </div>
            ) : null}
            {falseConfirmPassword ? (
              <div className="flex justify-center items-center bg-red-300 text-red-800 rounded px-3 text-center py-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height={isMobile ? "20px" : "24px"}
                  viewBox="0 -960 960 960"
                  width={isMobile ? "20px" : "24px"}
                  fill="#992B15"
                >
                  <path d="m40-120 440-760 440 760H40Zm138-80h604L480-720 178-200Zm302-40q17 0 28.5-11.5T520-280q0-17-11.5-28.5T480-320q-17 0-28.5 11.5T440-280q0 17 11.5 28.5T480-240Zm-40-120h80v-200h-80v200Zm40-100Z" />
                </svg>
                &nbsp; Passwords do not match.
              </div>
            ) : null}
            {/* <div>
            <label className="block mb-1 text-gray-700 font-medium">
              Mobile
            </label>
            <input
              type="tel"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              placeholder="9876543210"
              className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
            />
          </div> */}

            <div className="text-center mt-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full bg-indigo-500 text-white px-6 py-2 rounded-md font-semibold transition hover:bg-indigo-700 ${
                  isSubmitting
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:cursor-pointer"
                }`}
              >
                {isSubmitting ? "Submitting..." : "Change Password"}
              </button>
            </div>
          </form>
        </div>
        <div className="text-center mb-8">
          Remember password?&nbsp;
          <Link href={"/auth/login"}>
            <u>Login now.</u>
          </Link>
        </div>
      </div>
      <div className="fixed w-full bottom-0 mt-5">
        <Footer />
      </div>
    </>
  );
}
