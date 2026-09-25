import { convexClient, api } from "@/lib/convex-server";
import { createTRPCRouter, orgProcedure } from "../init";

export const billingRouter = createTRPCRouter({
  getStatus: orgProcedure.query(async ({ ctx }) => {
    const balance = await convexClient.query(api.credits.getBalance, {
      orgId: ctx.orgId,
    });

    return {
      hasActiveSubscription: true,
      balance,
    };
  }),

  getUsageAnalytics: orgProcedure.query(async ({ ctx }) => {
    const orgId = ctx.orgId;

    // Fetch records concurrently
    const [balance, generations, transcriptions, songs, sfxList, mediaList, stemList, singingList, agentSessions] =
      await Promise.all([
        convexClient.query(api.credits.getBalance, { orgId }),
        convexClient.query(api.generations.list, { orgId }),
        convexClient.query(api.transcriptions.list, { orgId }),
        convexClient.query(api.studio.listSongs, { orgId }),
        convexClient.query(api.studio.listSoundEffects, { orgId }),
        convexClient.query(api.studio.listMediaGenerations, { orgId }),
        convexClient.query(api.studio.listStems, { orgId }),
        convexClient.query(api.studio.listSingingCovers, { orgId }),
        convexClient.query(api.agent.listSessions, { orgId }),
      ]);

    // Format transaction ledger items
    type Transaction = {
      id: string;
      category: "tts" | "stt" | "beats" | "songs" | "sfx" | "media" | "stems" | "singing" | "agent";
      title: string;
      detail: string;
      credits: number;
      timestamp: number;
    };

    const transactions: Transaction[] = [];

    // 1. TTS Generations: 1 credit / character
    let ttsCredits = 0;
    for (const g of generations) {
      const cost = Math.max(1, g.text.length);
      ttsCredits += cost;
      transactions.push({
        id: `tts-${g._id}`,
        category: "tts",
        title: `Speech: "${g.text.slice(0, 32)}${g.text.length > 32 ? "…" : ""}"`,
        detail: `${g.voiceName} • ${g.text.length} chars`,
        credits: cost,
        timestamp: g._creationTime,
      });
    }

    // 2. Transcriptions: 15 credits / min (min 15)
    let sttCredits = 0;
    for (const t of transcriptions) {
      const durationSec = t.duration || 60;
      const minutes = Math.max(1, Math.ceil(durationSec / 60));
      const cost = minutes * 15;
      sttCredits += cost;
      transactions.push({
        id: `stt-${t._id}`,
        category: "stt",
        title: `Transcription: ${t.fileName}`,
        detail: `${Math.round(durationSec)}s audio • ${t.language || "auto"}`,
        credits: cost,
        timestamp: t._creationTime,
      });
    }

    // 3. Songs & Beats: 50 credits for beats, 150 for full songs
    let beatsCredits = 0;
    let songsCredits = 0;
    for (const s of songs) {
      const isBeat = s.title.startsWith("[Beat]");
      const cost = isBeat ? 50 : 150;
      if (isBeat) beatsCredits += cost;
      else songsCredits += cost;

      transactions.push({
        id: `song-${s._id}`,
        category: isBeat ? "beats" : "songs",
        title: isBeat ? `Beat: ${s.prompt.slice(0, 32)}` : `Song: ${s.prompt.slice(0, 32)}`,
        detail: `${s.duration}s • ${isBeat ? "Meta MusicGen" : "ACE-Step 1.5"}`,
        credits: cost,
        timestamp: s._creationTime,
      });
    }

    // 4. Sound Effects: 25 credits
    let sfxCredits = 0;
    for (const s of sfxList) {
      const cost = 25;
      sfxCredits += cost;
      transactions.push({
        id: `sfx-${s._id}`,
        category: "sfx",
        title: `SFX: ${s.prompt.slice(0, 32)}`,
        detail: `${s.duration}s • Meta AudioGen`,
        credits: cost,
        timestamp: s._creationTime,
      });
    }

    // 5. Media (Image = 20, Video = 200)
    let mediaCredits = 0;
    for (const m of mediaList) {
      const cost = m.type === "video" ? 200 : 20;
      mediaCredits += cost;
      transactions.push({
        id: `media-${m._id}`,
        category: "media",
        title: `${m.type === "video" ? "Video" : "Image"}: ${m.prompt.slice(0, 32)}`,
        detail: m.type === "video" ? `${m.duration || 4}s • Wan2.1` : `${m.aspectRatio || "1:1"} • SDXL-Turbo`,
        credits: cost,
        timestamp: m._creationTime,
      });
    }

    // 6. Stems Separation: 30 credits
    let stemsCredits = 0;
    for (const st of stemList) {
      const cost = 30;
      stemsCredits += cost;
      transactions.push({
        id: `stem-${st._id}`,
        category: "stems",
        title: `Stems: ${st.sourceFileName.slice(0, 32)}`,
        detail: "4-Track Separation • Demucs v4",
        credits: cost,
        timestamp: st._creationTime,
      });
    }

    // 7. AI Singing Covers: 50 credits
    let singingCredits = 0;
    for (const sc of singingList) {
      const cost = 50;
      singingCredits += cost;
      transactions.push({
        id: `singing-${sc._id}`,
        category: "singing",
        title: `Singing: ${sc.title.slice(0, 32)}`,
        detail: `Pitch ${sc.pitchShift >= 0 ? "+" : ""}${sc.pitchShift}st • RVC v2`,
        credits: cost,
        timestamp: sc._creationTime,
      });
    }

    // 8. Voice Agent Sessions: 5 credits / turn (or duration based)
    let agentCredits = 0;
    if (agentSessions) {
      for (const ag of agentSessions) {
        const turnCount = ag.messages?.filter((m) => m.role === "assistant").length || 1;
        const cost = Math.max(5, turnCount * 5);
        agentCredits += cost;
        transactions.push({
          id: `agent-${ag._id}`,
          category: "agent",
          title: `Voice Agent: ${ag.title || ag.persona}`,
          detail: `${ag.voiceName} • ${turnCount} turns • ${ag.durationSeconds || 0}s`,
          credits: cost,
          timestamp: ag._creationTime,
        });
      }
    }

    // Sort transactions by newest first
    transactions.sort((a, b) => b.timestamp - a.timestamp);

    const totalCreditsSpent =
      ttsCredits + sttCredits + beatsCredits + songsCredits + sfxCredits + mediaCredits + stemsCredits + singingCredits + agentCredits;

    const totalGenerationsCount = transactions.length;

    // Daily Timeline for the last 14 days
    const daysMap: Record<string, { date: string; credits: number; count: number }> = {};
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0]; // YYYY-MM-DD
      const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      daysMap[key] = { date: label, credits: 0, count: 0 };
    }

    for (const tx of transactions) {
      const txKey = new Date(tx.timestamp).toISOString().split("T")[0];
      if (daysMap[txKey]) {
        daysMap[txKey].credits += tx.credits;
        daysMap[txKey].count += 1;
      }
    }

    const dailyTrends = Object.values(daysMap);

    const categoryBreakdown = [
      { name: "TTS Speech", key: "tts", credits: ttsCredits, color: "#6366F1" },
      { name: "Transcription", key: "stt", credits: sttCredits, color: "#0EA5E9" },
      { name: "Voice Agent", key: "agent", credits: agentCredits, color: "#10B981" },
      { name: "Instrumental Beats", key: "beats", credits: beatsCredits, color: "#8B5CF6" },
      { name: "Full Songs", key: "songs", credits: songsCredits, color: "#A855F7" },
      { name: "Sound Effects", key: "sfx", credits: sfxCredits, color: "#F59E0B" },
      { name: "Visuals & Video", key: "media", credits: mediaCredits, color: "#EC4899" },
    ].filter((c) => c.credits > 0 || totalCreditsSpent === 0);

    return {
      balance,
      totalCreditsSpent,
      totalGenerationsCount,
      categoryBreakdown,
      dailyTrends,
      recentTransactions: transactions.slice(0, 50),
    };
  }),
});