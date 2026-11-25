"use client";

import Link from "next/link";
import AmbassadorBadge from "./AmbassadorBadge";
import { useEffect, useState } from "react";
import { PencilLine } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { loadAssignments, canEditEntity } from "./assignmentData";

export default function AmbassadorLink({ kind, entity }) {
  const { user } = useAuth();
  const userId = user?.id;
  const [result, setResult] = useState(null);
  useEffect(() => {
    if (!userId) return;
    let current = true;
    loadAssignments(userId).then(assignments => {
      if (current) setResult({ userId, assignments });
    }).catch(() => { if (current) setResult(null); });
    return () => { current = false; };
  }, [userId]);
  if (!userId || result?.userId !== userId) return null;
  const assignment = result.assignments.find(item => !entity || canEditEntity(item, kind, entity));
  if (!assignment) return null;
  const params = new URLSearchParams({ assignment: assignment.id });
  if (entity) {
    params.set("kind", kind);
    params.set("id", String(entity.id));
  }
  const link = <Link href={`/ambassador?${params}`} className="inline-flex min-h-11 items-center gap-2 rounded-xl px-2 text-sm font-semibold text-cyan-100 underline decoration-cyan-100/40 underline-offset-4 hover:text-white">
    <PencilLine size={16} aria-hidden="true" />{entity ? `Edit ${kind}` : "My ambassador workspace"}
  </Link>;
  if (entity) return link;
  return <div className="flex flex-wrap items-center gap-2">
    {[...new Set(result.assignments.map(item => item.role))].map(role => <AmbassadorBadge key={role} role={role} />)}
    {link}
  </div>;
}
