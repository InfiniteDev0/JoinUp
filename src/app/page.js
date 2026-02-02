"use client";

import { HyperText } from "@/components/ui/hyper-text";
import { TextAnimate } from "@/components/ui/text-animate";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Wait 5 seconds for animations to complete
    const timer = setTimeout(() => {
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
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="bg-[#fa5c00] h-screen w-screen flex flex-col items-center justify-center">
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
    </div>
  );
}
