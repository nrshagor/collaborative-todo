"use client";

import React, { useEffect, useState } from "react";
import { Form, Input, Button, Alert, Checkbox } from "@heroui/react";
import { useRouter } from "next/navigation";
import { getCookie, setCookie } from "cookie-handler-pro";
import "@/styles/auth/login.scss";
import Link from "next/link";
import Image from "next/image";
import logo from "@/images/signup.png";
import { PiEye, PiEyeClosed } from "react-icons/pi";

const Page = () => {
  const router = useRouter();

  // remember me
  const [rememberMe, setRememberMe] = useState(false);

  //eye icon
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => setIsVisible(!isVisible);

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Separate state for verification modal messages

  // Loading states
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const token = typeof window !== "undefined" ? getCookie("token") : null;
    if (token) {
      console.log("User is already logged in, redirecting...");
      router.push("/"); // Redirect to dashboard or homepage
    }
  }, []);

  // Function to clear alerts when user types
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "identifier") setIdentifier(value);
    if (name === "password") setPassword(value);

    // Clear alert messages on new input
    setShowSuccess(false);
    setShowError(false);
  };

  const handleLogin = async () => {
    try {
      setIsLoading(true); // Start loading
      const loginPayload = { identifier, password };

      console.log("Sending login request:", loginPayload);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(loginPayload),
        }
      );

      const data = await response.json();
      console.log("Login Response:", data);

      if (response.ok) {
        const token = data.access_token;
        console.log("Login successful, token:", token);

        // Set token cookie based on "Remember Me" selection
        setCookie("token", token, {
          expires: rememberMe ? "30d" : "1d", // 30 days if "Remember Me" is checked, else 1 day
          path: "/",
          domain: window.location.hostname,
          secure: process.env.NODE_ENV === "production",
          sameSite: "Lax",
        });
        localStorage.setItem("refreshToken", data.refresh_token);

        setSuccessMessage("Login successful!");
        setShowSuccess(true);
        setShowError(false);

        // Clear input fields after successful login
        setIdentifier("");
        setPassword("");

        router.push("/");
      } else {
        setErrorMessage(data.message || "Login failed.");
        setShowError(true);
        setShowSuccess(false);
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage("An error occurred. Please try again.");
      setShowError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await handleLogin();
  };

  return (
    <section className="login-section">
      <div className="login-container">
        <div className="login-left-content">
          <div className="flex flex-col gap-4  w-9/12">
            {/* Success & Error Messages for Login */}
            {showSuccess && (
              <Alert
                color="success"
                description={successMessage}
                isVisible={showSuccess}
                title="Success"
                variant="faded"
                onClose={() => setShowSuccess(false)}
              />
            )}
            {showError && (
              <Alert
                color="danger"
                description={errorMessage}
                isVisible={showError}
                title="Error"
                variant="faded"
                onClose={() => setShowError(false)}
              />
            )}
            {/* Login Form */}
            <div className="flex justify-between items-center text-black dark:text-white">
              <Link href="/">Logo</Link>
            </div>

            <h3 className="text-black dark:text-white">
              Sign in to your account
            </h3>
            <Form
              onSubmit={handleSubmit}
              className="w-full max-w-sm flex flex-col gap-6"
              validationBehavior="native">
              {/* Identifier Input */}
              <Input
                isRequired
                isDisabled={isLoading}
                errorMessage="Please enter a valid email"
                labelPlacement="outside"
                name="identifier"
                placeholder={`Enter your  email`}
                type={"email"}
                value={identifier}
                onChange={handleInputChange}
              />
              {/* Password Input */}
              <div className="password-section">
                <Input
                  isRequired
                  isDisabled={isLoading}
                  labelPlacement="outside"
                  name="password"
                  placeholder="Enter your password"
                  type={isVisible ? "text" : "password"}
                  value={password}
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
                      className="focus:outline-none"
                      type="button"
                      onClick={toggleVisibility}>
                      {isVisible ? <PiEye /> : <PiEyeClosed />}
                    </button>
                  }
                />
                <div className="forgot-password"> </div>
              </div>

              <small>
                <Checkbox
                  size="sm"
                  isSelected={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}>
                  <span className="text-black dark:text-white">
                    Remember me on this device
                  </span>
                </Checkbox>
              </small>
              {/* Submit Button */}
              <Button color="primary" type="submit" isDisabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </Form>
            <small className="text-black dark:text-white">
              Don&apos;t have a account?
              <Link href="/register" className="text-blue-500 font-bold">
                {""} Sign up now
              </Link>
            </small>
          </div>
        </div>
        <div className="login-right-content">
          <Image
            alt="login-image"
            src={logo}
            width={500}
            height={500}
            className="p-11"
          />
        </div>
      </div>
    </section>
  );
};

export default Page;
