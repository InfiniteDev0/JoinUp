"use client";

import React, { useState, useRef } from "react";
import {
  motion,
  useTransform,
  AnimatePresence,
  useMotionValue,
  useSpring,
} from "motion/react";
import { GridPattern } from "./grid-pattern";
import { cn } from "@/lib/utils";

export const AnimatedTooltip = ({ items }) => {
  const [activeIndex, setActiveIndex] = useState(0); // index of the person whose text is shown
  const [tooltipIndex, setTooltipIndex] = useState(0); // index of the person whose tooltip is shown (default to first)
  const springConfig = { stiffness: 100, damping: 15 };
  const x = useMotionValue(0);
  const animationFrameRef = useRef(null);

  const rotate = useSpring(
    useTransform(x, [-100, 100], [-45, 45]),
    springConfig,
  );
  const translateX = useSpring(
    useTransform(x, [-100, 100], [-50, 50]),
    springConfig,
  );

  const handleMouseMove = (event) => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    animationFrameRef.current = requestAnimationFrame(() => {
      const halfWidth = event.target.offsetWidth / 2;
      x.set(event.nativeEvent.offsetX - halfWidth);
    });
  };

  // Show the text of the activeIndex person below the avatars
  return (
    <div className="space-y-8 relative">
      <div className="flex flex-row gap-2 items-end justify-center">
        {items.map((item, idx) => {
          // Calculate arc position - creates a parabolic curve
          const totalItems = items.length;
          const middleIndex = (totalItems - 1) / 2;
          const distanceFromCenter = Math.abs(idx - middleIndex);
          const maxDistance = totalItems / 2;
          const arcHeight = (distanceFromCenter / maxDistance) * 40; // 40px max arc height

          return (
            <div
              className="group relative -mr-4"
              key={item.name}
              style={{
                transform: `translateY(${arcHeight}px)`,
              }}
              onMouseEnter={() => {
                setActiveIndex(idx);
                setTooltipIndex(idx);
              }}
              onMouseLeave={() => setTooltipIndex(activeIndex)}
            >
              <img
                onMouseMove={handleMouseMove}
                height={100}
                width={100}
                src={item.image}
                alt={item.name}
                className="relative !m-0 h-15 w-15 rounded-md border-2 border-white object-cover object-top !p-0 transition duration-500 group-hover:z-30 group-hover:scale-105"
              />
            </div>
          );
        })}
      </div>
      <div className="px-4 sm:px-20 py-6 flex flex-col gap-2 items-center justify-center w-full text-center text-base sm:text-lg">
        &quot;{items[activeIndex]?.body}&quot;
        <p className="text-center text-base sm:text-lg font-medium">
          @{items[activeIndex]?.name}
        </p>
        <p className="text-center text-gray-400 text-sm sm:text-base">
          {items[activeIndex]?.designation}
        </p>
      </div>
      <GridPattern
        width={30}
        height={30}
        x={-1}
        y={-1}
        strokeDasharray={"4 2"}
        className={cn(
          "[mask-image:radial-gradient(300px_circle_at_center,white,transparent)]",
        )}
      />
    </div>
  );
};
