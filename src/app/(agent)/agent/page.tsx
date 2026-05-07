"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AgentHomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/agent/dashboard");
  }, [router]);

  return null;
}
