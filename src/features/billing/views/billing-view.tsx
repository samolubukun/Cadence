"use client";

import { useState } from "react";
import { Coins, Plus, CheckCircle2, Sparkles } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { useOrganization } from "@clerk/nextjs";
import { useMutation as useConvexMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";

const CREDIT_PACKAGES = [
  {
    name: "Starter Pack",
    credits: 25000,
    price: "$5",
    description: "Great for testing and light generation (approx. 25,000 characters).",
    popular: false,
  },
  {
    name: "Creator Pack",
    credits: 100000,
    price: "$18",
    description: "Ideal for podcasters, audiobooks, and consistent voice generation.",
    popular: true,
  },
  {
    name: "Pro Studio",
    credits: 500000,
    price: "$75",
    description: "High volume speech-to-text diarization and extensive voice cloning.",
    popular: false,
  },
];

export function BillingView() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { organization } = useOrganization();
  const [addingPack, setAddingPack] = useState<string | null>(null);

  const { data: billingData } = useQuery(trpc.billing.getStatus.queryOptions());
  const balance = billingData?.balance ?? 10000;

  const addCreditsMutation = useConvexMutation(api.credits.addCredits);

  const handleClaimPack = async (pkg: typeof CREDIT_PACKAGES[number]) => {
    if (!organization?.id) {
      toast.error("Organization not selected");
      return;
    }
    setAddingPack(pkg.name);
    try {
      await addCreditsMutation({
        orgId: organization.id,
        amount: pkg.credits,
      });
      await queryClient.invalidateQueries({
        queryKey: trpc.billing.getStatus.queryKey(),
      });
      toast.success(`Successfully added ${pkg.credits.toLocaleString()} credits!`);
    } catch {
      toast.error("Failed to add credits");
    } finally {
      setAddingPack(null);
    }
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
      <PageHeader title="Billing & Credits" />
      <div className="flex-1 p-4 sm:p-6 lg:p-10 max-w-6xl w-full mx-auto space-y-8 overflow-y-auto">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
            Plan & Credit Allocation
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your organization&apos;s credit balance, top up instantly, and review usage rates.
          </p>
        </div>

        {/* Balance overview banner */}
      <Card className="border-border bg-gradient-to-r from-card via-card to-primary/5 shadow-xs">
        <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between p-6 gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-2xl ring-1 ring-primary/20">
              <Coins className="size-7 text-primary" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Current Available Balance
              </p>
              <p className="text-3xl font-extrabold tracking-tight text-foreground mt-0.5">
                {balance.toLocaleString()}&nbsp;
                <span className="text-sm font-normal text-muted-foreground">
                  credits
                </span>
              </p>
            </div>
          </div>
          <div className="text-xs text-muted-foreground grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 border-t sm:border-t-0 sm:border-l sm:pl-6 pt-3 sm:pt-0">
            <p className="flex items-center justify-between gap-2">
              <span className="font-semibold text-foreground">TTS Speech:</span> 1 credit / char
            </p>
            <p className="flex items-center justify-between gap-2">
              <span className="font-semibold text-foreground">Transcription:</span> 15 credits / min
            </p>
            <p className="flex items-center justify-between gap-2">
              <span className="font-semibold text-foreground">Voice Cloning:</span> 500 credits
            </p>
            <p className="flex items-center justify-between gap-2">
              <span className="font-semibold text-foreground">Instrumental Beats:</span> 50 credits
            </p>
            <p className="flex items-center justify-between gap-2">
              <span className="font-semibold text-foreground">Full Vocal Song:</span> 150 credits
            </p>
            <p className="flex items-center justify-between gap-2">
              <span className="font-semibold text-foreground">Sound Effects:</span> 25 credits
            </p>
            <p className="flex items-center justify-between gap-2">
              <span className="font-semibold text-foreground">AI Image / Video:</span> 20 / 200 credits
            </p>
            <p className="flex items-center justify-between gap-2">
              <span className="font-semibold text-foreground">Voice Changer:</span> 50 credits
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Packages / Top-up section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Top up Credits
          </h2>
          <p className="text-xs text-muted-foreground">
            Add credits directly to your organization balance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {CREDIT_PACKAGES.map((pkg) => (
            <Card
              key={pkg.name}
              className={`relative flex flex-col justify-between border transition hover:shadow-md ${
                pkg.popular
                  ? "border-primary shadow-xs ring-1 ring-primary"
                  : "border-border"
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-3 right-4 px-3 py-0.5 rounded-full bg-primary text-[10px] font-bold text-primary-foreground tracking-wider uppercase flex items-center gap-1 shadow-xs">
                  <Sparkles className="size-3" /> Popular
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-base font-semibold">{pkg.name}</CardTitle>
                <CardDescription className="text-xs min-h-[36px] mt-1">
                  {pkg.description}
                </CardDescription>
                <div className="pt-3">
                  <span className="text-3xl font-extrabold text-foreground">
                    {pkg.price}
                  </span>
                  <span className="text-xs text-muted-foreground ml-1.5">
                    one-time
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <div className="flex items-center gap-2 text-xs font-medium text-foreground bg-muted/30 px-3 py-2 rounded-lg">
                  <CheckCircle2 className="size-4 text-primary shrink-0" />
                  <span>+{pkg.credits.toLocaleString()} Credits</span>
                </div>
                <Button
                  variant={pkg.popular ? "default" : "outline"}
                  className="w-full gap-2 text-xs font-medium"
                  disabled={addingPack !== null}
                  onClick={() => handleClaimPack(pkg)}
                >
                  <Plus className="size-3.5" />
                  {addingPack === pkg.name ? "Adding..." : "Add Credits"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
    </div>
  );
}
