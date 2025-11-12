import React from "react";
import { usePlanGate } from "@/hooks/usePlanGate";
import UnauthorizedPage from "@/pages/UnauthorizedPage";

type Props = {
  children: React.ReactNode;
  /** "mentee" => any mentorship access (Builder/Master)
   *  "mentor" => mentor tools only (Master)
   *  default: "mentee"
   */
  role?: "mentee" | "mentor";
  /** Optional alternate UI when blocked */
  fallback?: React.ReactNode;
};

export default function RequireMentorship({
  role = "mentee",
  children,
  fallback,
}: Props) {
  const { requireMentorshipAccess, requireMentorRole } = usePlanGate();

  const ok =
    role === "mentor"
      ? requireMentorRole().ok
      : requireMentorshipAccess().ok;

  if (!ok) return <>{fallback ?? <UnauthorizedPage />}</>;
  return <>{children}</>;
}
