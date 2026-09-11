import { Coins } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

export function UsageContainer() {
  const trpc = useTRPC();
  const { data } = useQuery(trpc.billing.getStatus.queryOptions());

  const balance = data?.balance ?? 10000;

  return (
    <div className="group-data-[collapsible=icon]:hidden bg-background border border-border rounded-lg p-3">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase">
          <Coins className="size-3.5 text-primary" />
          <span>Credits</span>
        </div>
        <p className="text-xl font-bold tracking-tight text-foreground">
          {balance.toLocaleString()}
        </p>
        <p className="text-[11px] text-muted-foreground">
          Available balance
        </p>
      </div>
    </div>
  );
}
