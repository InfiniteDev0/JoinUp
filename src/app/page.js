"use client";

import { HyperText } from "@/components/ui/hyper-text";
import { TextAnimate } from "@/components/ui/text-animate";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";

export default function Home() {
  const router = useRouter();
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Wait 5 seconds for animations to complete
    const timer = setTimeout(() => {
      // Start exit animation
      setIsExiting(true);
      
      // Wait for exit animation to complete before redirecting
      setTimeout(() => {
        // Check localStorage for user details
        const userDetails = localStorage.getItem("userDetails");

        if (!userDetails) {
          // No user found, redirect to auth
          router.push("/auth");
        } else {
          // User exists, parse and get initials
          try {
            const user = JSON.parse(userDetails);
            const displayName = user.displayName || "";

            // Extract initials from display name
            const initials = displayName
              .split(" ")
              .map((name) => name.charAt(0).toUpperCase())
              .join("");

            // Redirect to client page with initials
            router.push(`/client/${initials || "USER"}`);
          } catch (error) {
            console.error("Error parsing user details:", error);
            router.push("/auth");
          }
        }
      }, 800); // Wait for blur/fade animation to complete
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <motion.div
      initial={{ opacity: 1, filter: "blur(0px)" }}
      animate={
        isExiting
          ? { opacity: 0, filter: "blur(10px)", scale: 0.95 }
          : { opacity: 1, filter: "blur(0px)", scale: 1 }
      }
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="bg-[#fa5c00] h-screen w-screen flex flex-col items-center justify-center"
    >
      <h1 className="changa text-6xl flex items-center">
        <HyperText animateOnHover={false} duration={1500}>
          Join
        </HyperText>
        <HyperText
          className="text-white"
          animateOnHover={false}
          duration={1500}
        >
          Up
        </HyperText>
      </h1>
      <TextAnimate animation="slideLeft" by="character" delay={1.5}>
        Game night, made easy.
      </TextAnimate>
    </motion.div>
  );
}
