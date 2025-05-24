"use client";

import React, { useState } from "react";
import { Form, Input, Button, Alert } from "@heroui/react";
import { useRouter } from "next/navigation";
import { setCookie } from "cookie-handler-pro";
import "@/styles/auth/register.scss";
import Image from "next/image";
import signUp from "@/images/signup.png";
import Link from "next/link";
import { PiEye, PiEyeClosed } from "react-icons/pi";

const Page = () => {
  const router = useRouter();

  //eye icon
  const [isVisiblePassword, setIsVisiblePassword] = useState(false);
  const [isVisibleConfirmPassword, setIsVisibleConfirmPassword] =
    useState(false);

  const toggleVisibilityPassword = () =>
    setIsVisiblePassword(!isVisiblePassword);
  const toggleVisibilityConfirmPassword = () =>
    setIsVisibleConfirmPassword(!isVisibleConfirmPassword);

  const [formSuccessMessage, setFormSuccessMessage] = useState("");
  const [formErrorMessage, setFormErrorMessage] = useState("");

  const [isRegistering, setIsRegistering] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  // Handle Input Change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear Form Messages
    setFormSuccessMessage("");
    setFormErrorMessage("");
  };

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsRegistering(true);

    setFormSuccessMessage("");
    setFormErrorMessage("");
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        role: "user",
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();
      console.log("Registration response:", data);

      if (response.ok) {
        setFormSuccessMessage(
          "Registration successful! Please verify your account."
        );

        handleLogin();

        // Clear Form Messages when OTP modal opens
        setTimeout(() => {
          setFormSuccessMessage("");
          setFormErrorMessage("");
        }, 500);
      } else {
        setFormErrorMessage(data.message || "Registration failed.");
      }
    } catch (error) {
      console.error("Registration error:", error);
      setFormErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsRegistering(false);
    }
  };

  const handleLogin = async () => {
    try {
      const loginPayload = {
        identifier: formData.email,
        password: formData.password,
      };

      console.log("Sending login request:", loginPayload);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(loginPayload),
        }
      );

      const data = await response.json();
      console.log("Login Response:", data);

      if (response.ok) {
        const token = data.access_token;

        setCookie("token", token, {
          httpOnly: false,
          secure: process.env.NODE_ENV !== "development",
          expires: 1,
        });

        localStorage.setItem("refreshToken", data.refresh_token);
        router.push("/");
      } else {
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <section className="register-section">
      <div className="register-container">
        <div className="register-left-content">
          <Image
            alt="login-image"
            src={signUp}
            width={500}
            height={500}
            className="p-11"
          />
        </div>
        <div className="register-right-content">
          <div className="flex flex-col gap-4 w-11/12">
            {/* Success & Error Messages */}
            {/* Form Messages */}
            {formSuccessMessage && (
              <Alert color="success" description={formSuccessMessage} />
            )}
            {formErrorMessage && (
              <Alert color="danger" description={formErrorMessage} />
            )}

            <div className="flex justify-between items-center text-black dark:text-white">
              <Link href="/">Logo</Link>
            </div>

            <h3 className="text-black dark:text-white">
              Sign Up to your account
            </h3>
            {/* Register Form */}
            <Form
              onSubmit={handleRegister}
              validationBehavior="native"
              className="w-full max-w-lg flex flex-col gap-6">
              <div className="flex w-full flex-wrap md:flex-nowrap gap-4">
                <Input
                  className="w-full"
                  isRequired
                  isDisabled={isRegistering}
                  label="Name"
                  name="name"
                  placeholder="Enter your first name"
                  onChange={handleInputChange}
                  validate={(value) => {
                    if (value.length < 3) {
                      return "Username must be at least 3 characters long";
                    }

                    return value === "admin" || value === "nrshagor"
                      ? "Nice try!"
                      : null;
                  }}
                />

                <Input
                  isRequired
                  isDisabled={isRegistering}
                  label="Email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  onChange={handleInputChange}
                />
              </div>

              <div className="flex w-full flex-wrap md:flex-nowrap gap-4">
                <Input
                  isRequired
                  isDisabled={isRegistering}
                  label="Password"
                  name="password"
                  type={isVisiblePassword ? "text" : "password"}
                  placeholder="Enter password"
                  onChange={handleInputChange}
                  validate={(value) => {
                    if (value.length < 6) {
                      return "Password must be 6 characters or more.";
                    }
                    if ((value.match(/[A-Za-z]/g) || []).length < 1) {
                      return "Password must contain at least one letter";
                    }
                    if ((value.match(/\d/gi) || []).length < 1) {
                      return "Password must contain at least one number";
                    }
                  }}
                  endContent={
                    <button
                      aria-label="toggle password visibility"
                      className="focus:outline-none text-black dark:text-white"
                      type="button"
                      onClick={toggleVisibilityPassword}>
                      {isVisiblePassword ? <PiEye /> : <PiEyeClosed />}
                    </button>
                  }
                />
                <Input
                  isRequired
                  isDisabled={isRegistering}
                  label="Confirm Password"
                  name="confirmPassword"
                  type={isVisibleConfirmPassword ? "text" : "password"}
                  placeholder="Confirm password"
                  onChange={handleInputChange}
                  validate={(value) => {
                    if (value.length < 6) {
                      return "Password must be 6 characters or more.";
                    }
                    if ((value.match(/[A-Za-z]/g) || []).length < 1) {
                      return "Password must contain at least one letter";
                    }
                    if ((value.match(/\d/gi) || []).length < 1) {
                      return "Password must contain at least one number";
                    }
                  }}
                  endContent={
                    <button
                      aria-label="toggle password visibility"
                      className="focus:outline-none text-black dark:text-white"
                      type="button"
                      onClick={toggleVisibilityConfirmPassword}>
                      {isVisibleConfirmPassword ? <PiEye /> : <PiEyeClosed />}
                    </button>
                  }
                />
              </div>

              {/* Fix: Sign Up Button is disabled if checkbox is not checked */}
              <Button color="primary" type="submit">
                {isRegistering ? "Registering..." : "Sign Up"}
              </Button>
            </Form>

            <small className="text-black dark:text-white">
              Already have an account?
              <Link href="/login" className="text-blue-500 font-bold">
                {""} Log in
              </Link>
            </small>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Page;
