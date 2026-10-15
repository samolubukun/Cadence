import { auth } from "@clerk/nextjs/server";
import { convexClient, api } from "@/lib/convex-server";
import { getSignedAudioUrl } from "@/lib/r2";
import type { Id } from "convex/_generated/dataModel";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ voiceId: string }> },
) {
  const { voiceId } = await params;

  const voice = await convexClient.query(api.voices.getById, {
    id: voiceId as Id<"voices">,
  });

  if (!voice) {
    return new Response("Not found", { status: 404 });
  }

  if (voice.variant === "CUSTOM") {
    const { userId, orgId } = await auth();
    if (!userId || !orgId || voice.orgId !== orgId) {
      return new Response("Unauthorized", { status: 401 });
    }
  }

  if (!voice.r2ObjectKey) {
    return new Response("Voice audio is not available yet", { status: 409 });
  }

  const signedUrl = await getSignedAudioUrl(voice.r2ObjectKey);
  const audioResponse = await fetch(signedUrl);

  if (!audioResponse.ok) {
    return new Response("Failed to fetch voice audio", { status: 502 });
  }

  const contentType = 
    audioResponse.headers.get("content-type") || "audio/wav";

  return new Response(audioResponse.body, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control":
        voice.variant === "SYSTEM"
          ? "public, max-age=86400"
          : "private, max-age=3600",
    },
  });
};