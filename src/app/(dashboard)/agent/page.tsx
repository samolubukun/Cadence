"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import {
  Mic,
  MicOff,
  Radio,
  Sparkles,
  Zap,
  Volume2,
  Settings2,
  RefreshCw,
  PhoneCall,
  PhoneOff,
  User,
  Bot,
  Activity,
  Sliders,
  CheckCircle2,
  ChevronRight,
  History,
  Calendar,
  Clock,
  MessageSquare,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import Image from "next/image";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { VoiceAvatar } from "@/components/voice-avatar/voice-avatar";
import { VOICE_CATEGORY_LABELS } from "@/features/voices/data/voice-categories";


interface MessageItem {
  id: string;
  role: "user" | "assistant" | "system";
  text: string;
  latencyMs?: number;
  timestamp: number;
}

const PERSONA_CONFIGS = [
  {
    id: "casual",
    name: "Casual Conversationalist",
    desc: "Witty, snappy, friendly daily banter with ultra-low latency.",
    badge: "Speed Optimized",
  },
  {
    id: "custom",
    name: "Custom Persona",
    desc: "Design your own custom system prompt and agent personality.",
    badge: "User Defined",
  },
];

const KOKORO_VOICES = [
  { id: "af_heart", name: "Heart (Warm American Female)" },
  { id: "af_bella", name: "Bella (Bright American Female)" },
  { id: "af_nicole", name: "Nicole (Professional Female)" },
  { id: "am_adam", name: "Adam (Clear American Male)" },
  { id: "am_michael", name: "Michael (Authoritative Male)" },
  { id: "am_george", name: "George (Warm British Male)" },
];

export default function VoiceAgentStudioPage() {
  const { orgId } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [agentState, setAgentState] = useState<"idle" | "listening" | "thinking" | "speaking">("idle");
  
  // Settings
  const [persona, setPersona] = useState<"casual" | "custom">("casual");
  const [customInstructions, setCustomInstructions] = useState<string>(
    "You are a helpful and intelligent AI voice assistant. Speak concisely, clearly, and naturally like an expert human."
  );
  const [voiceMode, setVoiceMode] = useState<"speed" | "cloned">("speed");
  const [chatterboxVoiceFilter, setChatterboxVoiceFilter] = useState<"all" | "cloned" | "system">("all");
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>("af_heart");
  const [bargeInSensitivity, setBargeInSensitivity] = useState<number>(65);


  // Session & Telemetry
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [currentTurnTelemetry, setCurrentTurnTelemetry] = useState<{
    ttft?: number;
    turnLatency?: number;
  }>({});
  const [callDuration, setCallDuration] = useState<number>(0);

  // Audio Contexts & WebSockets
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioWorkletNodeRef = useRef<AudioNode | null>(null);
  const audioQueueRef = useRef<AudioBuffer[]>([]);
  const isPlayingRef = useRef<boolean>(false);
  const nextPlayTimeRef = useRef<number>(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sessionStartTimeRef = useRef<number | null>(null);

  const trpc = useTRPC();
  const { data: voicesData } = useQuery(trpc.voices.getAll.queryOptions());
  const userCustomVoices = voicesData?.custom ?? [];
  const systemVoices = voicesData?.system ?? [];
  const allCadenceVoices = [...userCustomVoices, ...systemVoices];
  const { data: recentSessions, refetch: refetchSessions } = useQuery(trpc.agent.listSessions.queryOptions());
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  // Fetch full details and conversation turns when a past session is clicked
  const { data: selectedSessionData, isLoading: isLoadingSessionDetails } = useQuery(
    trpc.agent.getSession.queryOptions(
      { sessionId: selectedSessionId ?? "" },
      { enabled: !!selectedSessionId }
    )
  );

  // tRPC Mutations
  const initSessionMutation = useMutation(trpc.agent.initSession.mutationOptions());
  const endSessionMutation = useMutation(trpc.agent.endSession.mutationOptions({
    onSuccess: () => {
      refetchSessions();
    },
  }));
  const recordTurnMutation = useMutation(trpc.agent.recordTurn.mutationOptions());

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll transcript on new messages or updates
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages]);


  // Call duration counter
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isConnected) {
      sessionStartTimeRef.current = Date.now();
      interval = setInterval(() => {
        if (sessionStartTimeRef.current) {
          setCallDuration(Math.floor((Date.now() - sessionStartTimeRef.current) / 1000));
        }
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(interval);
  }, [isConnected]);

  // 3D/Canvas Reactive Audio Visualizer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;

      let freqData = new Uint8Array(32);
      if (analyserRef.current) {
        analyserRef.current.getByteFrequencyData(freqData);
      }
      const avgFreq = freqData.reduce((a, b) => a + b, 0) / (freqData.length || 1);
      const intensity = Math.min(1.0, avgFreq / 120);

      // Harmonious cyber-acoustic color palette
      let primaryRgb = "16, 185, 129";   // Emerald
      let secondaryRgb = "6, 182, 212";  // Neon Cyan
      let accentRgb = "52, 211, 153";    // Bright Mint

      if (agentState === "listening") {
        primaryRgb = "5, 150, 105";    // Deep Emerald
        secondaryRgb = "6, 182, 212";   // Electric Cyan
        accentRgb = "110, 231, 183";   // Mint
      } else if (agentState === "thinking") {
        primaryRgb = "20, 184, 166";   // Teal
        secondaryRgb = "52, 211, 153";  // Mint
        accentRgb = "45, 212, 191";    // Aqua
      } else if (agentState === "speaking") {
        primaryRgb = "16, 185, 129";   // Vivid Emerald
        secondaryRgb = "6, 182, 212";   // Neon Cyan
        accentRgb = "167, 243, 208";   // Crisp white-mint
      }

      phase += 0.03;

      // 1. Deep Seamless Radial Ambient Glow
      const coreR = 72 + intensity * 24;
      const ambientGlow = ctx.createRadialGradient(
        centerX,
        centerY,
        coreR * 0.2,
        centerX,
        centerY,
        coreR * 2.5
      );
      ambientGlow.addColorStop(0, `rgba(${primaryRgb}, 0.38)`);
      ambientGlow.addColorStop(0.35, `rgba(${secondaryRgb}, 0.16)`);
      ambientGlow.addColorStop(0.7, `rgba(${accentRgb}, 0.04)`);
      ambientGlow.addColorStop(1, "rgba(0, 0, 0, 0)");

      ctx.beginPath();
      ctx.arc(centerX, centerY, coreR * 2.5, 0, Math.PI * 2);
      ctx.fillStyle = ambientGlow;
      ctx.fill();

      // 2. Liquid Acoustic Organic Sphere (Outer Liquid Waves)
      const liquidLayers = [
        { harmonics: 6, speed: 1.2, amp: 8 + intensity * 24, alpha: 0.9, width: 2.5, rgb: primaryRgb, scale: 1.0 },
        { harmonics: 8, speed: -0.9, amp: 6 + intensity * 20, alpha: 0.65, width: 1.8, rgb: secondaryRgb, scale: 1.15 },
        { harmonics: 5, speed: 1.8, amp: 5 + intensity * 15, alpha: 0.45, width: 1.2, rgb: accentRgb, scale: 1.28 },
      ];

      liquidLayers.forEach((layer) => {
        ctx.beginPath();
        const steps = 96;
        const targetRadius = coreR * layer.scale;
        for (let i = 0; i <= steps; i++) {
          const angle = (i / steps) * Math.PI * 2;
          // Organic fluid displacement
          const wave =
            Math.sin(angle * layer.harmonics + phase * layer.speed) *
            Math.cos(angle * 2 - phase * 0.5) *
            layer.amp;
          const r = targetRadius + wave;
          const x = centerX + Math.cos(angle) * r;
          const y = centerY + Math.sin(angle) * r;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = `rgba(${layer.rgb}, ${layer.alpha})`;
        ctx.lineWidth = layer.width;
        ctx.stroke();
      });

      // 3. Seamless Liquid Core (Soft volumetric orb)
      const innerCoreGrad = ctx.createRadialGradient(
        centerX,
        centerY - coreR * 0.25,
        coreR * 0.05,
        centerX,
        centerY,
        coreR * 0.85
      );
      innerCoreGrad.addColorStop(0, `rgba(${accentRgb}, 0.85)`);
      innerCoreGrad.addColorStop(0.5, `rgba(${primaryRgb}, 0.5)`);
      innerCoreGrad.addColorStop(0.85, `rgba(${secondaryRgb}, 0.25)`);
      innerCoreGrad.addColorStop(1, `rgba(${primaryRgb}, 0.05)`);

      ctx.beginPath();
      const coreSteps = 64;
      for (let i = 0; i <= coreSteps; i++) {
        const angle = (i / coreSteps) * Math.PI * 2;
        const wave = Math.sin(angle * 4 + phase * 1.5) * (4 + intensity * 10);
        const r = coreR * 0.85 + wave;
        const x = centerX + Math.cos(angle) * r;
        const y = centerY + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fillStyle = innerCoreGrad;
      ctx.fill();

      // 4. Subtle Harmonic Sound Wave Bars (Blended into the heart of the orb)
      const numBars = 5;
      const barSpacing = 7;
      const startX = centerX - ((numBars - 1) * barSpacing) / 2;
      for (let b = 0; b < numBars; b++) {
        const barX = startX + b * barSpacing;
        const distFromCenter = Math.abs(b - 2);
        // Harmonic height response based on audio intensity and smooth sine
        const barHeight =
          12 +
          (3 - distFromCenter) * 6 +
          Math.sin(phase * 4 + b * 0.7) * (6 + intensity * 18);

        const barGradient = ctx.createLinearGradient(
          barX,
          centerY - barHeight / 2,
          barX,
          centerY + barHeight / 2
        );
        barGradient.addColorStop(0, `rgba(${accentRgb}, 0.95)`);
        barGradient.addColorStop(0.5, `rgba(255, 255, 255, 0.9)`);
        barGradient.addColorStop(1, `rgba(${secondaryRgb}, 0.9)`);

        ctx.beginPath();
        ctx.roundRect(barX - 1.5, centerY - barHeight / 2, 3, barHeight, 2);
        ctx.fillStyle = barGradient;
        ctx.fill();
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [agentState]);

  const activeSourceRef = useRef<AudioBufferSourceNode | null>(null);

  // Audio queue gapless player
  const playNextInQueue = useCallback(() => {
    if (!audioContextRef.current) return;

    if (audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume();
    }

    if (audioQueueRef.current.length === 0) {
      isPlayingRef.current = false;
      activeSourceRef.current = null;
      setAgentState((prev) => (prev === "speaking" ? "listening" : prev));
      return;
    }

    isPlayingRef.current = true;
    setAgentState("speaking");
    const buffer = audioQueueRef.current.shift()!;
    const source = audioContextRef.current.createBufferSource();
    source.buffer = buffer;
    activeSourceRef.current = source;

    // Connect to analyser for reactive visualizer
    if (analyserRef.current) {
      source.connect(analyserRef.current);
      analyserRef.current.connect(audioContextRef.current.destination);
    } else {
      source.connect(audioContextRef.current.destination);
    }

    const currentTime = audioContextRef.current.currentTime;
    const startTime = Math.max(currentTime, nextPlayTimeRef.current);
    source.start(startTime);
    nextPlayTimeRef.current = startTime + buffer.duration;

    source.onended = () => {
      if (activeSourceRef.current === source) {
        activeSourceRef.current = null;
      }
      playNextInQueue();
    };
  }, []);

  // Barge-in / Interrupt: stop active playback and clear audio queue immediately
  const handleBargeIn = useCallback(() => {
    if (activeSourceRef.current) {
      try {
        activeSourceRef.current.stop();
      } catch (e) {
        // ignore already stopped
      }
      activeSourceRef.current = null;
    }
    audioQueueRef.current = [];
    nextPlayTimeRef.current = 0;
    isPlayingRef.current = false;
    setAgentState("listening");
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "response.cancel" }));
    }
  }, []);

  // Connect & Start Voice Session
  const handleStartSession = async () => {
    try {
      setIsConnecting(true);
      const voiceName =
        voiceMode === "speed"
          ? KOKORO_VOICES.find((v) => v.id === selectedVoiceId)?.name || "Heart (Kokoro)"
          : allCadenceVoices?.find((v) => v.id === selectedVoiceId)?.name || "Custom Voice Persona";




      const initData = await initSessionMutation.mutateAsync({
        persona,
        voiceMode,
        voiceName,
        voiceId: voiceMode === "cloned" ? selectedVoiceId : undefined,
        instructions: persona === "custom" ? customInstructions : undefined,
      });

      setSessionId(initData.sessionId);

      // 1. Initialize AudioContext at 24000Hz (native Realtime PCM format)
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 24000,
      });
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;

      // 2. Microphone Capture
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 24000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      mediaStreamRef.current = stream;

      // 3. Connect WebSocket to Modal Agent Engine
      const socket = new WebSocket(initData.wsUrl);
      wsRef.current = socket;

      socket.onopen = () => {
        setIsConnecting(false);
        setIsConnected(true);
        setAgentState("listening");
        toast.success("Voice Agent connected! Start speaking.");

        // Send session configuration
        socket.send(
          JSON.stringify({
            type: "session.update",
            session: {
              persona,
              voice: selectedVoiceId,
              voice_mode: voiceMode,
              voice_key: initData.voiceKey,
              cadence_api_url: initData.cadenceApiUrl,
              cadence_api_key: initData.cadenceApiKey,
              sample_rate: 24000,
              instructions: persona === "custom" ? customInstructions : undefined,
            },
          })
        );

        // Hook up audio capture to WebSocket stream
        const source = audioCtx.createMediaStreamSource(stream);
        const scriptProcessor = audioCtx.createScriptProcessor(4096, 1, 1);
        audioWorkletNodeRef.current = scriptProcessor;

        let speechDetected = false;
        let speechBytesCount = 0;
        let silenceTimer: NodeJS.Timeout | null = null;

        scriptProcessor.onaudioprocess = (e) => {
          if (isMuted) return;
          const inputData = e.inputBuffer.getChannelData(0);

          // Energy check for user speech
          let sum = 0;
          for (let i = 0; i < inputData.length; i++) {
            sum += inputData[i] * inputData[i];
          }
          const rms = Math.sqrt(sum / inputData.length);
          // Normalized speech threshold with higher baseline to avoid room noise
          const speechThreshold = Math.max(0.018, (100 - bargeInSensitivity) / 3000);

          // If user speaks while assistant is speaking, trigger barge-in!
          if (rms > speechThreshold && isPlayingRef.current) {
            handleBargeIn();
          }

          // Convert Float32Array to Int16Array PCM
          const pcm16 = new Int16Array(inputData.length);
          for (let i = 0; i < inputData.length; i++) {
            const s = Math.max(-1, Math.min(1, inputData[i]));
            pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
          }

          // Send raw binary PCM frame over WebSocket
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(pcm16.buffer);
            speechBytesCount += pcm16.buffer.byteLength;

            // Track voice activity and commit turn after silence
            if (rms > speechThreshold) {
              speechDetected = true;
              if (silenceTimer) {
                clearTimeout(silenceTimer);
                silenceTimer = null;
              }
            } else if (speechDetected && speechBytesCount > 12000) {
              // User was speaking and paused -> wait 700ms then commit
              if (!silenceTimer) {
                silenceTimer = setTimeout(() => {
                  if (socket.readyState === WebSocket.OPEN && speechDetected) {
                    socket.send(JSON.stringify({ type: "input_audio_buffer.commit" }));
                    speechDetected = false;
                    speechBytesCount = 0;
                  }
                  silenceTimer = null;
                }, 700);
              }
            }
          }
        };

        source.connect(scriptProcessor);
        scriptProcessor.connect(audioCtx.destination);
      };

      socket.onmessage = async (event) => {
        if (typeof event.data === "string") {
          try {
            const data = jsonParse(event.data);
            if (!data) return;

            // STT Transcription finished
            if (data.type === "conversation.item.input_audio_transcription.completed") {
              const text = data.transcript;
              if (text) {
                setMessages((prev) => [
                  ...prev,
                  { id: Math.random().toString(), role: "user", text, timestamp: Date.now() },
                ]);
                recordTurnMutation.mutate({
                  sessionId: initData.sessionId,
                  role: "user",
                  text,
                });
                setAgentState("thinking");
              }
            }

            // LLM Text Delta
            if (data.type === "response.text.delta") {
              const delta = data.delta;
              if (delta) {
                setCurrentTurnTelemetry({ ttft: data.ttft_ms });
              }
            }

            // TTS Audio Chunk Delta
            if (data.type === "response.audio.delta") {
              const b64Audio = data.delta;
              if (b64Audio && audioCtx) {
                const binaryStr = atob(b64Audio);
                const bytes = new Uint8Array(binaryStr.length);
                for (let i = 0; i < binaryStr.length; i++) {
                  bytes[i] = binaryStr.charCodeAt(i);
                }
                const pcm16 = new Int16Array(bytes.buffer);
                const float32 = new Float32Array(pcm16.length);
                for (let i = 0; i < pcm16.length; i++) {
                  float32[i] = pcm16[i] / 32768.0;
                }

                const audioBuffer = audioCtx.createBuffer(1, float32.length, 24000);
                audioBuffer.copyToChannel(float32, 0);
                audioQueueRef.current.push(audioBuffer);

                if (data.telemetry) {
                  setCurrentTurnTelemetry({
                    ttft: data.telemetry.ttft_ms,
                    turnLatency: data.telemetry.total_turn_ms,
                  });
                }

                if (!isPlayingRef.current) {
                  playNextInQueue();
                }
              }
            }

            // Full response completed
            if (data.type === "response.done") {
              const assistantText = data.output?.text;
              if (assistantText) {
                setMessages((prev) => [
                  ...prev,
                  {
                    id: Math.random().toString(),
                    role: "assistant",
                    text: assistantText,
                    latencyMs: data.output?.duration_ms,
                    timestamp: Date.now(),
                  },
                ]);
                recordTurnMutation.mutate({
                  sessionId: initData.sessionId,
                  role: "assistant",
                  text: assistantText,
                  latencyMs: data.output?.duration_ms,
                });
              }
            }

            // Barge-in notification from server
            if (data.type === "response.cancel") {
              if (activeSourceRef.current) {
                try {
                  activeSourceRef.current.stop();
                } catch (e) {}
                activeSourceRef.current = null;
              }
              audioQueueRef.current = [];
              isPlayingRef.current = false;
              nextPlayTimeRef.current = 0;
              setAgentState("listening");
            }
          } catch (err) {
            console.error("Error handling WS message:", err);
          }
        }
      };

      socket.onerror = (err) => {
        console.error("Voice Agent WebSocket error:", err);
        toast.error("WebSocket connection failed. Falling back to local simulation mode if offline.");
      };

      socket.onclose = () => {
        handleEndSession();
      };
    } catch (err: any) {
      setIsConnecting(false);
      toast.error(err.message || "Failed to launch Voice Agent session");
    }
  };

  // Gracefully conclude session
  const handleEndSession = async () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (sessionId) {
      endSessionMutation.mutate({
        sessionId,
        durationSeconds: callDuration,
      });
    }
    setIsConnected(false);
    setIsConnecting(false);
    setAgentState("idle");
    toast.info("Voice Agent call ended.");
  };

  function jsonParse(str: string) {
    try {
      return JSON.parse(str);
    } catch {
      return null;
    }
  }

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="flex flex-1 flex-col h-full bg-background overflow-hidden">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b px-6 py-4 bg-background/50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20">
            <Radio className="size-5 animate-pulse text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight">Cadence Real-Time Voice Agent</h1>
              <Badge variant="outline" className="text-[11px] bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                Realtime Neural Engine
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Ultra-low latency speech-to-speech AI with instant barge-in interruption & custom timbres.
            </p>
          </div>
        </div>

        {/* Live Call Telemetry & Duration */}
        <div className="flex items-center gap-4">
          {isConnected && (
            <div className="flex items-center gap-3 bg-muted/40 border px-3 py-1.5 rounded-full text-xs font-mono">
              <span className="flex size-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="font-semibold text-foreground">{formatDuration(callDuration)}</span>
              {currentTurnTelemetry.turnLatency && (
                <span className="text-muted-foreground border-l pl-2">
                  Latency: <strong className="text-emerald-400">{currentTurnTelemetry.turnLatency}ms</strong>
                </span>
              )}
              {currentTurnTelemetry.ttft && (
                <span className="text-muted-foreground border-l pl-2">
                  TTFT: <strong className="text-teal-400">{currentTurnTelemetry.ttft}ms</strong>
                </span>
              )}
            </div>
          )}

          {!isConnected ? (
            <Button
              onClick={handleStartSession}
              disabled={isConnecting}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium shadow-md shadow-emerald-500/20 border-0"
            >
              {isConnecting ? (
                <>
                  <RefreshCw className="size-4 animate-spin mr-2" />
                  Connecting Agent...
                </>
              ) : (
                <>
                  <PhoneCall className="size-4 mr-2" />
                  Start Voice Session
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleEndSession}
              variant="destructive"
              className="shadow-md shadow-red-500/20 font-medium"
            >
              <PhoneOff className="size-4 mr-2" />
              End Session
            </Button>
          )}
        </div>
      </div>

      {/* Main Studio Workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left / Center: Interactive Reactive Orb & Live Transcript */}
        <div className="flex flex-1 flex-col border-r overflow-hidden relative bg-radial from-emerald-950/20 via-background to-background">
          {/* Reactive 3D Voice Orb Canvas */}
          <div className="relative flex flex-1 flex-col items-center justify-center p-6 min-h-[340px]">
            <canvas
              ref={canvasRef}
              width={480}
              height={360}
              className="w-[420px] h-[310px]"
            />

            {/* Current State Indicator */}
            <div className="absolute bottom-6 flex flex-col items-center gap-2">
              <Badge
                variant="secondary"
                className="px-4 py-1 text-xs tracking-wider uppercase font-semibold backdrop-blur-md bg-background/80 border shadow-sm"
              >
                {agentState === "idle" && "Standby • Ready"}
                {agentState === "listening" && "Listening to user..."}
                {agentState === "thinking" && "Generating conversational response..."}
                {agentState === "speaking" && "Cadence Speaking (Barge-in enabled)"}
              </Badge>
              {isConnected && (
                <div className="flex items-center gap-2 mt-1">
                  <Button
                    size="sm"
                    variant={isMuted ? "destructive" : "outline"}
                    className="h-8 rounded-full px-3 text-xs"
                    onClick={() => setIsMuted(!isMuted)}
                  >
                    {isMuted ? <MicOff className="size-3.5 mr-1" /> : <Mic className="size-3.5 mr-1" />}
                    {isMuted ? "Unmute Mic" : "Mute Mic"}
                  </Button>
                  {agentState === "speaking" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 rounded-full px-3 text-xs text-amber-500 border-amber-500/30 hover:bg-amber-500/10"
                      onClick={handleBargeIn}
                    >
                      Interrupt (Barge In)
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Synchronized Live Conversation HUD */}
          <div className="flex-[0.85] min-h-[220px] max-h-[45%] border-t bg-card/30 backdrop-blur-md flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/20 text-xs text-muted-foreground shrink-0">
              <span className="font-semibold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Activity className="size-3.5 text-emerald-400" />
                Synchronized Turn Transcripts
              </span>
              <span>{messages.length} turns recorded</span>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-3 font-sans scroll-smooth">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground text-xs py-8">
                  <Bot className="size-6 mb-2 opacity-40 text-emerald-400" />
                  <p>No conversation turns yet.</p>
                  <p className="text-[11px] opacity-70">Start the voice session and speak into your microphone.</p>
                </div>
              ) : (
                <>
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex items-start gap-2.5 max-w-[85%] ${
                        msg.role === "user" ? "ml-auto flex-row-reverse" : ""
                      }`}
                    >
                      <div
                        className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                          msg.role === "user"
                            ? "bg-emerald-600 text-white"
                            : "bg-teal-700 text-white shadow-xs"
                        }`}
                      >
                        {msg.role === "user" ? <User className="size-3.5" /> : <Bot className="size-3.5" />}
                      </div>
                      <div
                        className={`rounded-2xl px-3.5 py-2 text-xs shadow-xs ${
                          msg.role === "user"
                            ? "bg-emerald-600 text-white"
                            : "bg-muted/70 text-foreground border"
                        }`}
                      >
                        <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                        {msg.latencyMs && (
                          <span className="block mt-1 text-[10px] opacity-70 font-mono">
                            Synthesized in {msg.latencyMs}ms
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  {/* Padding anchor ensuring the last message is never cut off by viewport edge */}
                  <div ref={messagesEndRef} className="h-6 w-full shrink-0" />
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Persona, Voice & Engine Tuning */}
        <div className="w-80 flex flex-col overflow-y-auto p-5 space-y-6 bg-card/20">
          {/* Persona Selection */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Sparkles className="size-4 text-emerald-400" />
              <span>Agent Persona</span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {PERSONA_CONFIGS.map((p) => {
                const active = persona === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => !isConnected && setPersona(p.id as any)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      active
                        ? "border-emerald-500 bg-emerald-500/10 shadow-xs"
                        : "border-border/60 hover:border-border hover:bg-muted/30"
                    } ${isConnected ? "opacity-60 cursor-not-allowed" : ""}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-foreground">{p.name}</span>
                      <Badge variant="outline" className="text-[9px] py-0 px-1.5 border-emerald-500/30 text-emerald-400">
                        {p.badge}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-snug">{p.desc}</p>
                  </div>
                );
              })}
            </div>

            {/* Custom Persona Prompt Field */}
            {persona === "custom" && (
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-medium text-muted-foreground flex items-center justify-between">
                  <span>Custom Persona Instructions</span>
                  <span className="text-[10px] text-emerald-400 font-mono">System Prompt</span>
                </label>
                <Textarea
                  value={customInstructions}
                  disabled={isConnected}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  placeholder="e.g. You are a Shakespearean actor who replies in dramatic Elizabethan English..."
                  rows={3}
                  className="text-xs resize-none rounded-xl border-emerald-500/30 bg-card/60 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
                />
                <p className="text-[10px] text-muted-foreground">
                  The agent will adopt this custom behavior and personality in real time.
                </p>
              </div>
            )}
          </div>

          {/* Voice Mode: Speed Mode vs Cloned Mode */}
          <div className="space-y-3 pt-2 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Volume2 className="size-4 text-purple-400" />
                <span>Voice Architecture</span>
              </div>
              <Badge variant="outline" className="text-[10px]">
                {voiceMode === "speed" ? "Kokoro 28x" : "Chatterbox"}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 p-1 bg-muted/40 rounded-lg border">
              <button
                type="button"
                disabled={isConnected}
                onClick={() => {
                  setVoiceMode("speed");
                  setSelectedVoiceId("af_heart");
                }}
                className={`py-1.5 text-xs font-semibold rounded-md transition-all ${
                  voiceMode === "speed"
                    ? "bg-background shadow-xs text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                ⚡ Speed Mode
              </button>
              <button
                type="button"
                disabled={isConnected}
                onClick={() => {
                  setVoiceMode("cloned");
                  if (userCustomVoices && userCustomVoices.length > 0) {
                    setSelectedVoiceId(userCustomVoices[0].id);
                  } else if (systemVoices && systemVoices.length > 0) {
                    setSelectedVoiceId(systemVoices[0].id);
                  }
                }}
                className={`py-1.5 text-xs font-semibold rounded-md transition-all ${
                  voiceMode === "cloned"
                    ? "bg-background shadow-xs text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                🧬 Chatterbox Persona
              </button>
            </div>

            {/* Voice Dropdown */}
            {voiceMode === "speed" ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-muted-foreground">Curated Voice</label>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-emerald-500/30 text-emerald-400">
                    28x Real-Time
                  </Badge>
                </div>
                <Select
                  value={selectedVoiceId}
                  onValueChange={setSelectedVoiceId}
                  disabled={isConnected}
                >
                  <SelectTrigger className="w-full h-11 gap-2.5 rounded-xl border border-border/80 bg-card/60 px-3 py-2 hover:bg-accent/40 transition-colors shadow-2xs">
                    <SelectValue>
                      {(() => {
                        const voice = KOKORO_VOICES.find((v) => v.id === selectedVoiceId) || KOKORO_VOICES[0];
                        return (
                          <div className="flex items-center gap-2.5 min-w-0">
                            <VoiceAvatar seed={voice.id} name={voice.name} className="size-6 border border-white/20 shadow-xs" />
                            <div className="flex flex-col text-left min-w-0">
                              <span className="text-xs font-semibold tracking-tight truncate">{voice.name}</span>
                              <span className="text-[10px] text-muted-foreground">Kokoro Neural TTS</span>
                            </div>
                          </div>
                        );
                      })()}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    <SelectGroup>
                      <SelectLabel className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">
                        Broadcast Studio Voices
                      </SelectLabel>
                      {KOKORO_VOICES.map((v) => (
                        <SelectItem key={v.id} value={v.id} className="py-2 cursor-pointer">
                          <div className="flex items-center gap-2.5">
                            <VoiceAvatar seed={v.id} name={v.name} className="size-5 border border-white/10" />
                            <div className="flex flex-col">
                              <span className="text-xs font-medium">{v.name}</span>
                              <span className="text-[10px] text-muted-foreground">Ultra-Low Latency (~70ms)</span>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-muted-foreground">Seed / Cloned Voice</label>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-teal-500/30 text-teal-400">
                    Timbre Matching
                  </Badge>
                </div>

                {/* Sub-filter Toggle: Cloned vs System Library vs All */}
                <div className="grid grid-cols-3 gap-1 p-1 bg-muted/40 rounded-lg border text-[11px]">
                  <button
                    type="button"
                    disabled={isConnected}
                    onClick={() => setChatterboxVoiceFilter("all")}
                    className={`py-1 rounded-md font-medium transition-all ${
                      chatterboxVoiceFilter === "all"
                        ? "bg-background text-foreground shadow-2xs font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    All ({allCadenceVoices.length})
                  </button>
                  <button
                    type="button"
                    disabled={isConnected}
                    onClick={() => {
                      setChatterboxVoiceFilter("cloned");
                      if (userCustomVoices.length > 0 && !userCustomVoices.some((v) => v.id === selectedVoiceId)) {
                        setSelectedVoiceId(userCustomVoices[0].id);
                      }
                    }}
                    className={`py-1 rounded-md font-medium transition-all ${
                      chatterboxVoiceFilter === "cloned"
                        ? "bg-background text-foreground shadow-2xs font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Cloned ({userCustomVoices.length})
                  </button>
                  <button
                    type="button"
                    disabled={isConnected}
                    onClick={() => {
                      setChatterboxVoiceFilter("system");
                      if (systemVoices.length > 0 && !systemVoices.some((v) => v.id === selectedVoiceId)) {
                        setSelectedVoiceId(systemVoices[0].id);
                      }
                    }}
                    className={`py-1 rounded-md font-medium transition-all ${
                      chatterboxVoiceFilter === "system"
                        ? "bg-background text-foreground shadow-2xs font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Library ({systemVoices.length})
                  </button>
                </div>

                {allCadenceVoices && allCadenceVoices.length > 0 ? (
                  <Select
                    value={selectedVoiceId}
                    onValueChange={setSelectedVoiceId}
                    disabled={isConnected}
                  >
                    <SelectTrigger className="w-full h-11 gap-2.5 rounded-xl border border-border/80 bg-card/60 px-3 py-2 hover:bg-accent/40 transition-colors shadow-2xs">
                      <SelectValue>
                        {(() => {
                          const voice = allCadenceVoices.find((v) => v.id === selectedVoiceId) || allCadenceVoices[0];
                          if (!voice) return "Select voice";
                          return (
                            <div className="flex items-center gap-2.5 min-w-0">
                              <VoiceAvatar seed={voice.id} name={voice.name} className="size-6 border border-white/20 shadow-xs" />
                              <div className="flex flex-col text-left min-w-0">
                                <span className="text-xs font-semibold tracking-tight truncate">{voice.name}</span>
                                <span className="text-[10px] text-muted-foreground truncate">
                                  {voice.category
                                    ? (VOICE_CATEGORY_LABELS[voice.category as keyof typeof VOICE_CATEGORY_LABELS] ?? voice.category)
                                    : voice.language || "Custom Persona"}
                                </span>
                              </div>
                            </div>
                          );
                        })()}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="max-h-72">
                      {(chatterboxVoiceFilter === "all" || chatterboxVoiceFilter === "cloned") && userCustomVoices.length > 0 && (
                        <SelectGroup>
                          <SelectLabel className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground flex items-center justify-between">
                            <span>Custom Cloned Voices</span>
                            <Badge variant="secondary" className="text-[9px] h-4 px-1">
                              {userCustomVoices.length}
                            </Badge>
                          </SelectLabel>
                          {userCustomVoices.map((v) => (
                            <SelectItem key={v.id} value={v.id} className="py-2 cursor-pointer">
                              <div className="flex items-center gap-2.5">
                                <VoiceAvatar seed={v.id} name={v.name} className="size-5 border border-white/10" />
                                <div className="flex flex-col text-left min-w-0">
                                  <span className="text-xs font-medium truncate">{v.name}</span>
                                  <span className="text-[10px] text-muted-foreground">
                                    {v.language ? `Lang: ${v.language}` : "Custom Clone"}
                                  </span>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      )}
                      {chatterboxVoiceFilter === "all" && userCustomVoices.length > 0 && systemVoices.length > 0 && (
                        <SelectSeparator />
                      )}
                      {(chatterboxVoiceFilter === "all" || chatterboxVoiceFilter === "system") && systemVoices.length > 0 && (
                        <SelectGroup>
                          <SelectLabel className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground flex items-center justify-between">
                            <span>Library Seed Voices</span>
                            <Badge variant="secondary" className="text-[9px] h-4 px-1">
                              {systemVoices.length}
                            </Badge>
                          </SelectLabel>
                          {systemVoices.map((v) => (
                            <SelectItem key={v.id} value={v.id} className="py-2 cursor-pointer">
                              <div className="flex items-center gap-2.5">
                                <VoiceAvatar seed={v.id} name={v.name} className="size-5 border border-white/10" />
                                <div className="flex flex-col text-left min-w-0">
                                  <span className="text-xs font-medium truncate">{v.name}</span>
                                  <span className="text-[10px] text-muted-foreground">
                                    {VOICE_CATEGORY_LABELS[v.category as keyof typeof VOICE_CATEGORY_LABELS] ?? v.category} • {v.language}
                                  </span>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      )}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="p-3 border border-dashed rounded-xl text-center text-xs text-muted-foreground bg-muted/10">
                    No voices found in Cadence. Explore voices in{" "}
                    <a href="/voices" className="text-emerald-400 font-medium underline">
                      Explore Voices
                    </a>{" "}
                    or clone in{" "}
                    <a href="/voice-clone" className="text-emerald-400 font-medium underline">
                      Voice Clone Studio
                    </a>
                    .
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Barge-In Interruption Sensitivity */}
          <div className="space-y-3 pt-2 border-t">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <Sliders className="size-3.5 text-emerald-400" />
                Barge-In Sensitivity
              </span>
              <span className="font-mono text-muted-foreground">{bargeInSensitivity}%</span>
            </div>
            <Slider
              value={[bargeInSensitivity]}
              min={20}
              max={95}
              step={1}
              onValueChange={(val) => setBargeInSensitivity(val[0])}
            />
            <p className="text-[10px] text-muted-foreground">
              Higher values interrupt the agent faster when detecting background speech or words.
            </p>
          </div>

          {/* Recent Voice Agent Sessions */}
          <div className="space-y-3 pt-2 border-t flex-1">
            <div className="flex items-center justify-between text-xs font-semibold text-foreground">
              <span className="flex items-center gap-1.5">
                <History className="size-3.5 text-emerald-400" />
                Recent Sessions
              </span>
              <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-400">
                {recentSessions?.length || 0}
              </Badge>
            </div>
            <div className="space-y-2">
              {recentSessions && recentSessions.length > 0 ? (
                recentSessions.slice(0, 5).map((s: { _id: string; title?: string; durationSeconds?: number; persona: string; voiceName: string; messages?: any[] }) => (
                  <div
                    key={s._id}
                    onClick={() => setSelectedSessionId(s._id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        setSelectedSessionId(s._id);
                      }
                    }}
                    className="group p-2.5 rounded-lg border bg-muted/20 text-xs space-y-1 hover:bg-muted/50 hover:border-emerald-500/40 cursor-pointer transition-all active:scale-[0.99] focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground truncate group-hover:text-emerald-400 transition-colors">
                        {s.title || "Voice Session"}
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {s.durationSeconds ? `${s.durationSeconds}s` : "active"}
                        </span>
                        <ChevronRight className="size-3 text-muted-foreground group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span className="capitalize">{s.persona}</span>
                      <span>•</span>
                      <span className="truncate">{s.voiceName}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-xs text-muted-foreground">
                  No previous sessions yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Session Details & Full Transcript Dialog */}
      <Dialog open={!!selectedSessionId} onOpenChange={(open) => !open && setSelectedSessionId(null)}>
        <DialogContent className="max-w-xl max-h-[85vh] flex flex-col">
          <DialogHeader className="border-b pb-3">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
              <History className="size-4" />
              <span>Voice Session Details</span>
            </div>
            <DialogTitle className="text-base font-bold text-foreground">
              {selectedSessionData?.title || "Voice Agent Session"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground flex items-center gap-3 pt-1">
              <span className="flex items-center gap-1">
                <Clock className="size-3" />
                {selectedSessionData?.durationSeconds ? `${selectedSessionData.durationSeconds} seconds` : "Active call"}
              </span>
              <span>•</span>
              <span className="capitalize">{selectedSessionData?.persona} persona</span>
              <span>•</span>
              <span>Voice: {selectedSessionData?.voiceName}</span>
            </DialogDescription>
          </DialogHeader>

          {/* Transcript Content in Modal */}
          <div className="flex-1 overflow-y-auto py-4 space-y-3 min-h-[200px] max-h-[50vh] pr-1">
            {isLoadingSessionDetails ? (
              <div className="flex items-center justify-center h-32 text-xs text-muted-foreground gap-2">
                <RefreshCw className="size-4 animate-spin text-emerald-400" />
                Loading conversation logs...
              </div>
            ) : !selectedSessionData?.messages || selectedSessionData.messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-xs text-muted-foreground text-center">
                <MessageSquare className="size-6 mb-2 opacity-30 text-emerald-400" />
                <p>No recorded transcript turns for this session.</p>
              </div>
            ) : (
              selectedSessionData.messages.map((m: any, idx: number) => (
                <div
                  key={idx}
                  className={`flex items-start gap-2.5 max-w-[90%] ${
                    m.role === "user" ? "ml-auto flex-row-reverse" : ""
                  }`}
                >
                  <div
                    className={`flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${
                      m.role === "user"
                        ? "bg-emerald-600 text-white"
                        : "bg-teal-700 text-white shadow-xs"
                    }`}
                  >
                    {m.role === "user" ? <User className="size-3" /> : <Bot className="size-3" />}
                  </div>
                  <div
                    className={`rounded-2xl px-3.5 py-2 text-xs shadow-xs ${
                      m.role === "user"
                        ? "bg-emerald-600 text-white"
                        : "bg-muted/70 text-foreground border"
                    }`}
                  >
                    <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>
                    {m.latencyMs && (
                      <span className="block mt-1 text-[10px] opacity-70 font-mono">
                        TTS: {m.latencyMs}ms
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
