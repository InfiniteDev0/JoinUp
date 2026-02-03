"use client";
import dynamic from "next/dynamic";

const AnimatedTooltip = dynamic(
  () =>
    import("@/components/ui/animated-tooltip").then(
      (mod) => mod.AnimatedTooltip,
    ),
  { ssr: false },
);
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { TextAnimate } from "@/components/ui/text-animate";
import { signInWithGoogle } from "@/lib/auth";
import { toast, Toaster } from "sonner";
import { motion, AnimatePresence } from "motion/react";

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const people = [
    {
      id: 1,
      name: "Alex Chen",
      designation: "Game Night Host",
      body: "JoinUp transformed our weekly game nights! No more juggling multiple apps to coordinate.",
      image: "https://avatars.githubusercontent.com/u/16860528",
    },
    {
      id: 2,
      name: "Sarah Martinez",
      designation: "Trivia Enthusiast",
      body: "The real-time gameplay is smooth and the trivia features keep everyone engaged.",
      image: "https://avatars.githubusercontent.com/u/20110627",
    },
    {
      id: 3,
      name: "Mike Johnson",
      designation: "Casual Gamer",
      body: "Finally, a platform that makes organizing game sessions effortless.",
      image: "https://avatars.githubusercontent.com/u/106103625",
    },
    {
      id: 4,
      name: "Emma Davis",
      designation: "Board Game Fan",
      body: "I love how JoinUp creates a social experience whether we're together or apart.",
      image: "https://avatars.githubusercontent.com/u/59228569",
    },
    {
      id: 5,
      name: "Chris Thompson",
      designation: "Competitive Player",
      body: "The scoring system and results tracking keep things exciting.",
      image: "https://avatars.githubusercontent.com/u/59442788",
    },
    {
      id: 6,
      name: "Lisa Park",
      designation: "Social Connector",
      body: "JoinUp made it so easy to reconnect with friends through gaming. ",
      image: "https://avatars.githubusercontent.com/u/89768406",
    },
  ];

  // Map Firebase error codes to user-friendly messages
  function getFriendlyError(error) {
    if (!error?.code) return error?.message || "An error occurred.";
    switch (error.code) {
      case "auth/invalid-credential":
      case "auth/user-not-found":
      case "auth/wrong-password":
        return "Invalid email or password.";
      case "auth/too-many-requests":
        return "Too many failed attempts. Please try again later.";
      case "auth/popup-closed-by-user":
        return "Google sign-in was cancelled.";
      default:
        return error.message || "An error occurred.";
    }
  }

  // Handle Google login
  const handleGoogle = async () => {
    setLoading(true);
    try {
      const userCredential = await signInWithGoogle();
      const user = userCredential.user;

      const userDetails = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified,
      };
      localStorage.setItem("userDetails", JSON.stringify(userDetails));

      toast.success(`Welcome, ${user.displayName}!`);

      setTimeout(() => {
        const displayName = user.displayName || "";
        const initials = displayName
          .split(" ")
          .map((name) => name.charAt(0).toUpperCase())
          .join("");
        router.push(`/client/${initials || "USER"}`);
      }, 1000);
    } catch (err) {
      toast.error(getFriendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid h-svh items-center lg:grid-cols-2 bg-black text-white overflow-hidden">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex flex-col justify-center gap-2 md:justify-start">
          <Link href="/" className="flex items-center gap-2 font-medium">
            <h1 className="changa text-3xl flex items-center text-white">
              Join
              <span className="text-[#fa5c00]">Up</span>
            </h1>
          </Link>
          <TextAnimate
            animation="slideLeft"
            by="character"
            className={"text-sm text-gray-400"}
            delay={1.5}
          >
            Game night, made easy.
          </TextAnimate>
        </div>
      </div>
      <div className="relative flex flex-col items-center justify-center p-6">
        <div className="w-full flex flex-col items-center justify-center gap-4">
          <div className="flex flex-col items-center justify-center gap-5 w-full">
            <AnimatedTooltip items={people} />
          </div>
        </div>

        <div className="w-full flex flex-col gap-3 px-5 mt-6">
          <Button
            type="button"
            className="flex gap-2 items-center h-10 w-full text-base bg-white hover:bg-gray-100 text-black border-2 border-white"
            onClick={handleGoogle}
            disabled={loading}
          >
            <svg
              className="size-4"
              viewBox="0 0 48 48"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g>
                <path
                  fill="#4285F4"
                  d="M24 9.5c3.54 0 6.7 1.22 9.2 3.6l6.85-6.85C36.45 2.7 30.7 0 24 0 14.82 0 6.73 5.8 2.7 14.1l7.98 6.2C12.1 13.7 17.6 9.5 24 9.5z"
                />
                <path
                  fill="#34A853"
                  d="M46.1 24.5c0-1.64-.15-3.22-.42-4.75H24v9.02h12.4c-.54 2.9-2.18 5.36-4.65 7.04l7.2 5.6C43.7 37.1 46.1 31.3 46.1 24.5z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.68 28.3c-1.1-3.2-1.1-6.7 0-9.9l-7.98-6.2C.9 16.1 0 20.2 0 24.5c0 4.3.9 8.4 2.7 12.3l7.98-6.2z"
                />
                <path
                  fill="#EA4335"
                  d="M24 48c6.48 0 11.92-2.14 15.9-5.8l-7.2-5.6c-2.02 1.36-4.6 2.16-8.7 2.16-6.4 0-11.9-4.2-13.9-10.1l-7.98 6.2C6.73 42.2 14.82 48 24 48z"
                />
                <path fill="none" d="M0 0h48v48H0z" />
              </g>
            </svg>
            {loading ? "Signing in..." : "Sign in with Google"}
          </Button>
        </div>
        <Toaster position="top-center" theme="dark" richColors />
      </div>
    </div>
  );
};

export default Auth;
