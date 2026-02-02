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
import { LoginForm } from "@/components/forms/login-form";
import { motion, AnimatePresence } from "motion/react";

const Auth = () => {
  const [showLoginForm, setShowLoginForm] = useState(false);
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

  return (
    <div className="grid min-h-svh items-center lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex flex-col justify-center gap-2 md:justify-start">
          <Link href="/" className="flex items-center gap-2 font-medium">
            <h1 className="changa text-3xl flex items-center">
              Join
              <span className="text-[#fa5c00]">Up</span>
            </h1>
          </Link>
          <TextAnimate
            animation="slideLeft"
            by="character"
            className={"text-sm"}
            delay={1.5}
          >
            Game night, made easy.
          </TextAnimate>
        </div>
      </div>
      <div className="relative flex flex-col items-center justify-center p-6">
        <AnimatePresence mode="wait">
          {!showLoginForm ? (
            <motion.div
              key="tooltip-section"
              initial={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.3 }}
              className="w-full flex flex-col items-center justify-center gap-10"
            >
              <div className="flex flex-col items-center justify-center gap-5 w-full">
                <AnimatedTooltip items={people} />
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {!showLoginForm ? (
          <div className="w-full flex flex-col gap-3 px-5 max-w-md mt-10">
            <Button
              className={"bg-[#fa5c00] hover:bg-[#fa5c00]/90 h-12 text-sm"}
              onClick={() => router.push("/onboarding")}
            >
              Get Started
            </Button>
            <Button
              className={"bg-foreground hover:bg-foreground/90 h-12 text-sm"}
              onClick={() => setShowLoginForm(true)}
            >
              Already a member? JoinUp
            </Button>
          </div>
        ) : null}

        <AnimatePresence>
          {showLoginForm && (
            <motion.div
              key="login-form"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="w-full max-w-md flex flex-col gap-3"
            >
              <LoginForm />
              <Button
                className={"bg-[#fa5c00] hover:bg-[#fa5c00]/90 h-12 text-sm"}
                onClick={() => router.push("/onboarding")}
              >
                Get Started
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Auth;
