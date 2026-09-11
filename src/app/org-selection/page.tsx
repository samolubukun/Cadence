import Image from "next/image";
import { OrganizationList } from "@clerk/nextjs";

export default function OrgSelectionPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-luminous-canvas p-4 curtain-glow">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-white p-2 shadow-md border border-cyan-100">
          <Image
            src="/logo.svg"
            alt="Cadence"
            width={38}
            height={38}
            className="size-9.5 object-contain"
          />
        </div>
        <span className="text-3xl font-bold tracking-tight text-foreground">
          Cadence
        </span>
      </div>

      <OrganizationList
        hidePersonal
        afterCreateOrganizationUrl="/dashboard"
        afterSelectOrganizationUrl="/dashboard"
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-xl border border-black/5 bg-white/90 backdrop-blur-md rounded-2xl",
          },
        }}
      />
    </div>
  );
};
