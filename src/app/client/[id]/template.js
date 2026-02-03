"use client";

import PageTransition from "@/components/PageTransition";

export default function ClientTemplate({ children }) {
  return <PageTransition>{children}</PageTransition>;
}
