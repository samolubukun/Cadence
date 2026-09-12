"use client";

import { useState } from "react";
import {
  Mic,
  MicOff,
  UploadCloud,
  FileAudio,
  Play,
  Pause,
  RefreshCw,
  Copy,
  Check,
  Download,
  FileText,
  Headphones,
  Clock,
  ChevronRight,
  ListFilter,
} from "lucide-react";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { formatDistanceToNow } from "date-fns";

interface WordTimestamp {
  word: string;
  start?: number;
  end?: number;
  score?: number;
  speaker?: string;
}

interface Segment {
  start: number;
  end: number;
  text: string;
  speaker?: string;
  words?: WordTimestamp[];
}

export function SpeechToTextView() {
  const trpc = useTRPC();
  const [file, setFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [diarize, setDiarize] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);

  const [activeFileName, setActiveFileName] = useState<string | null>(null);
  const [transcriptionResult, setTranscriptionResult] = useState<{
    text: string;
    segments: Segment[];
    language?: string;
    duration?: number;
  } | null>(null);

  const [viewMode, setViewMode] = useState<"interactive" | "plain">("plain");
  const [copied, setCopied] = useState(false);

  // Fetch past transcriptions for current org
  const { data: historyList, refetch: refetchHistory } = useQuery(
    trpc.transcriptions.getAll.queryOptions()
  );

  const copyEntireTranscript = () => {
    if (!transcriptionResult?.text) return;
    navigator.clipboard.writeText(transcriptionResult.text);
    setCopied(true);
    toast.success("Transcript copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadAsTxt = () => {
    if (!transcriptionResult?.text) return;
    const blob = new Blob([transcriptionResult.text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${activeFileName || "cadence-transcript"}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded transcript (.txt)");
  };

  const downloadAsSrt = () => {
    if (!transcriptionResult?.segments?.length) return;
    const formatTime = (seconds: number) => {
      const date = new Date(0);
      date.setMilliseconds(seconds * 1000);
      const iso = date.toISOString().substr(11, 12);
      return iso.replace(".", ",");
    };

    let srtContent = "";
    transcriptionResult.segments.forEach((seg, idx) => {
      srtContent += `${idx + 1}\n`;
      srtContent += `${formatTime(seg.start)} --> ${formatTime(seg.end)}\n`;
      srtContent += `${seg.text.trim()}\n\n`;
    });

    const blob = new Blob([srtContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${activeFileName || "cadence-subtitles"}.srt`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded subtitles (.srt)");
  };

  const transcribeMutation = useMutation(
    trpc.transcriptions.transcribe.mutationOptions({
      onSuccess: async (data) => {
        setTranscriptionResult({
          text: data.text,
          segments: data.segments,
          language: data.language,
          duration: data.duration,
        });
        setActiveFileName(data.fileName);
        refetchHistory();
        toast.success("Transcription complete!");
      },
      onError: (err) => {
        toast.error(err.message || "Failed to transcribe audio");
      },
    })
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setAudioUrl(URL.createObjectURL(selectedFile));
      setActiveFileName(selectedFile.name);
      setTranscriptionResult(null);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/wav" });
        const recordedFile = new File([blob], "recording.wav", { type: "audio/wav" });
        setFile(recordedFile);
        setAudioUrl(URL.createObjectURL(blob));
        setActiveFileName("recording.wav");
        setTranscriptionResult(null);
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      toast.info("Recording started");
    } catch {
      toast.error("Microphone access denied or not available");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      toast.success("Recording captured");
    }
  };

  const handleTranscribe = async () => {
    if (!file) {
      toast.error("Please upload or record audio first");
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64Data = (reader.result as string).split(",")[1];
      toast.info("Uploading audio and transcribing via Whisper large-v3…");
      transcribeMutation.mutate({
        fileName: file.name,
        base64Audio: base64Data,
        mimeType: file.type || "audio/wav",
        diarize,
      });
    };
    reader.onerror = () => {
      toast.error("Failed to read audio file");
    };
  };

  const togglePlayback = () => {
    if (audioElement) {
      if (isPlaying) {
        audioElement.pause();
        setIsPlaying(false);
      } else {
        audioElement.play();
        setIsPlaying(true);
      }
    }
  };

  const loadPastTranscription = (item: any) => {
    setTranscriptionResult({
      text: item.text,
      segments: item.segments,
      language: item.language,
      duration: item.duration,
    });
    setActiveFileName(item.fileName);
    toast.success(`Loaded transcription for "${item.fileName}"`);
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
      <PageHeader title="Speech to Text & Subtitles" />
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
              <Headphones className="h-7 w-7 text-blue-500" />
              Speech to Text &amp; Subtitles
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Transcribe spoken audio, generate word-level timestamps, and export subtitle files (.srt, .vtt) powered by Whisper large-v3.
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left panel: audio input & options */}
          <div className="w-full lg:w-1/3 flex flex-col gap-6">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-lg">Audio Input</CardTitle>
                <CardDescription>
                  Upload an audio file or record directly from your microphone.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-6 bg-muted/20 hover:bg-muted/40 transition">
                  <UploadCloud className="h-8 w-8 text-muted-foreground mb-2" />
                  <label className="cursor-pointer text-sm font-medium text-primary hover:underline">
                    <span>Choose an audio file</span>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-muted-foreground mt-1">WAV, MP3, M4A, or FLAC</p>
                  {file && (
                    <div className="mt-4 flex items-center gap-2 text-xs font-medium text-foreground bg-accent px-3 py-1.5 rounded-md">
                      <FileAudio className="h-4 w-4" />
                      <span className="truncate max-w-[180px]">{file.name}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">Or record voice</span>
                  <Button
                    variant={isRecording ? "destructive" : "outline"}
                    size="sm"
                    onClick={isRecording ? stopRecording : startRecording}
                    className="gap-2"
                  >
                    {isRecording ? (
                      <>
                        <MicOff className="h-4 w-4 animate-pulse text-destructive" />
                        Stop Recording
                      </>
                    ) : (
                      <>
                        <Mic className="h-4 w-4 text-primary" />
                        Record Microphone
                      </>
                    )}
                  </Button>
                </div>

                {audioUrl && (
                  <div className="mt-2 space-y-2">
                    <span className="text-xs font-semibold text-muted-foreground uppercase">Audio Player</span>
                    <audio
                      src={audioUrl}
                      ref={(el) => setAudioElement(el)}
                      onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                      onEnded={() => setIsPlaying(false)}
                      controls
                      className="w-full h-10"
                    />
                  </div>
                )}

                <Button
                  onClick={handleTranscribe}
                  disabled={!file || transcribeMutation.isPending}
                  className="w-full mt-2 font-semibold bg-blue-600 hover:bg-blue-500 text-white"
                >
                  {transcribeMutation.isPending ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                      Transcribing with Whisper…
                    </>
                  ) : (
                    "Transcribe Audio"
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Transcription History */}
            <Card className="border-border bg-card">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    Past Transcriptions
                  </CardTitle>
                  <span className="text-[11px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {historyList?.length ?? 0}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 max-h-[300px] overflow-y-auto">
                {!historyList || historyList.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    No past transcriptions found.
                  </p>
                ) : (
                  historyList.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => loadPastTranscription(item)}
                      className="w-full text-left p-2.5 rounded-lg border border-border/60 hover:bg-muted/40 hover:border-border transition flex items-center justify-between gap-3 group"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-foreground truncate group-hover:text-blue-500 transition">
                          {item.fileName}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                          {item.text.slice(0, 50)}...
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-1">
                          <span>{item.duration ? `${item.duration.toFixed(0)}s` : "audio"}</span>
                          <span>•</span>
                          <span>{formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}</span>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground shrink-0" />
                    </button>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right panel: results */}
          <div className="w-full lg:w-2/3">
            <Card className="border-border bg-card h-full flex flex-col min-h-[500px]">
              <CardHeader className="border-b border-border/50 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg">
                      {activeFileName ? `Transcript: ${activeFileName}` : "Transcription Results"}
                    </CardTitle>
                    <CardDescription>
                      {transcriptionResult
                        ? `Language: ${transcriptionResult.language?.toUpperCase() || "EN"} • Duration: ${transcriptionResult.duration?.toFixed(1) ?? "0"}s`
                        : "Results will display here after processing."}
                    </CardDescription>
                  </div>
                  {transcriptionResult && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center rounded-lg border bg-muted/30 p-0.5 text-xs">
                        <Button
                          variant={viewMode === "plain" ? "secondary" : "ghost"}
                          size="sm"
                          className="h-7 text-xs px-2.5"
                          onClick={() => setViewMode("plain")}
                        >
                          Text
                        </Button>
                        <Button
                          variant={viewMode === "interactive" ? "secondary" : "ghost"}
                          size="sm"
                          className="h-7 text-xs px-2.5"
                          onClick={() => setViewMode("interactive")}
                        >
                          Timestamps
                        </Button>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1 text-xs"
                        onClick={copyEntireTranscript}
                      >
                        {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                        Copy
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1 text-xs"
                        onClick={downloadAsTxt}
                      >
                        <FileText className="h-3.5 w-3.5" />
                        .txt
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1 text-xs"
                        onClick={downloadAsSrt}
                      >
                        <Download className="h-3.5 w-3.5" />
                        .srt
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
                {!transcriptionResult ? (
                  <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-muted-foreground">
                    <FileAudio className="h-10 w-10 stroke-[1.2] mb-2" />
                    <p className="text-sm">Upload, record, or select a past transcription to view.</p>
                  </div>
                ) : viewMode === "plain" ? (
                  <div className="p-5 rounded-xl border border-border bg-muted/10 space-y-4">
                    <div className="flex items-center justify-between text-xs text-muted-foreground border-b border-border/50 pb-2">
                      <span>Full Transcript</span>
                      <span>{transcriptionResult.duration?.toFixed(1) ?? "0.0"}s total</span>
                    </div>
                    <p className="text-base leading-relaxed text-foreground whitespace-pre-wrap select-all font-normal">
                      {transcriptionResult.text}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transcriptionResult.segments.map((seg, idx) => {
                      const isCurrentSegment =
                        currentTime >= seg.start && currentTime <= seg.end;
                      return (
                        <div
                          key={idx}
                          className={`p-4 rounded-xl border transition ${
                            isCurrentSegment
                              ? "border-primary/50 bg-primary/5 shadow-xs"
                              : "border-border bg-muted/10 hover:bg-muted/20"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-primary">
                              Segment {idx + 1}
                            </span>
                            <span className="text-[11px] font-mono text-muted-foreground">
                              {seg.start.toFixed(1)}s - {seg.end.toFixed(1)}s
                            </span>
                          </div>
                          <p className="text-sm leading-relaxed text-foreground">
                            {seg.words && seg.words.length > 0 ? (
                              seg.words.map((w, wIdx) => {
                                const isCurrentWord =
                                  w.start !== undefined &&
                                  w.end !== undefined &&
                                  currentTime >= w.start &&
                                  currentTime <= w.end;
                                return (
                                  <span
                                    key={wIdx}
                                    onClick={() => {
                                      if (audioElement && w.start !== undefined) {
                                        audioElement.currentTime = w.start;
                                        setCurrentTime(w.start);
                                        if (!isPlaying) {
                                          audioElement.play();
                                          setIsPlaying(true);
                                        }
                                      }
                                    }}
                                    className={`inline-block mr-1.5 transition-colors cursor-pointer rounded px-1 py-0.5 ${
                                      isCurrentWord
                                        ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                                        : "hover:bg-muted/40 text-foreground"
                                    }`}
                                  >
                                    {w.word}
                                  </span>
                                );
                              })
                            ) : (
                              seg.text
                            )}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
