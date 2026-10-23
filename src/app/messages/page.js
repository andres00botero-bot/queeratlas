"use client";

import { Suspense } from "react";
import PrivateMessages from "@/components/community/PrivateMessages";

export default function MessagesPage() {
  return <Suspense fallback={<main className="min-h-screen bg-[#0B1220]" />}><PrivateMessages /></Suspense>;
}