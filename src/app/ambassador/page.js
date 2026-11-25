import AmbassadorWorkspace from "@/components/ambassador/AmbassadorWorkspace";

export const metadata = {
  title: "Ambassador workspace | Queer Atlas",
  robots: { index: false, follow: false },
};

export default async function AmbassadorPage({ searchParams }) {
  const params = await searchParams;
  return <AmbassadorWorkspace initialAssignment={String(params?.assignment || "")}
    initialKind={params?.kind === "venue" ? "venue" : "event"} initialId={String(params?.id || "")} />;
}
