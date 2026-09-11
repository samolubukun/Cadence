"use client";

import { useState } from "react";
import { Mic, MicOff, UploadCloud, FileAudio, Play, Pause, RefreshCw, UserCheck, Copy, Check, Download, FileText } from "lucide-react";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";

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

  const [transcriptionResult, setTranscriptionResult] = useState<{
    text: string;
    segments: Segment[];
    language?: string;
    duration?: number;
  } | null>(null);

  const [viewMode, setViewMode] = useState<"interactive" | "plain">("plain");
  const [copied, setCopied] = useState(false);

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
    link.download = "cadence-transcript.txt";
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
    link.download = "cadence-subtitles.srt";
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
        setTranscriptionResult(null);
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      toast.info("Recording started");
    } catch {
      toast.error("Could not access microphone");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      toast.info("Recording stopped");
    }
  };

  const handleTranscribe = async () => {
    if (!file) {
      toast.error("Please upload or record an audio file first.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const resultStr = reader.result as string;
      const base64Audio = resultStr.split(",")[1];
      transcribeMutation.mutate({
        fileName: file.name,
        base64Audio,
        mimeType: file.type || "audio/wav",
        diarize,
      });
    };
    reader.readAsDataURL(file);
  };

  const togglePlayAudio = () => {
    if (!audioUrl) return;
    if (!audioElement) {
      const audio = new Audio(audioUrl);
      audio.ontimeupdate = () => {
        setCurrentTime(audio.currentTime);
      };
      audio.onended = () => {
        setIsPlaying(false);
      };
      audio.play();
      setAudioElement(audio);
      setIsPlaying(true);
    } else {
      if (isPlaying) {
        audioElement.pause();
        setIsPlaying(false);
      } else {
        audioElement.play();
        setIsPlaying(true);
      }
    }
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
      <PageHeader title="Speech to Text & Subtitles" />
      <div className="flex-1 flex flex-col lg:flex-row gap-6 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
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
                {isRecording ? <MicOff className="h-4 w-4 animate-pulse" /> : <Mic className="h-4 w-4" />}
                {isRecording ? "Stop Recording" : "Record Mic"}
              </Button>
            </div>

            {audioUrl && (
              <div className="flex items-center justify-between border border-border p-3 rounded-lg bg-background">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={togglePlayAudio}
                  className="rounded-full"
                >
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </Button>
                <div className="text-xs text-muted-foreground">
                  {currentTime.toFixed(1)}s
                </div>
              </div>
            )}

            <Button
              className="w-full mt-2"
              onClick={handleTranscribe}
              disabled={!file || transcribeMutation.isPending}
            >
              {transcribeMutation.isPending ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Transcribing...
                </>
              ) : (
                "Start Transcription"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Right panel: Transcription results & Speaker Segments */}
      <div className="w-full lg:w-2/3 flex flex-col gap-6">
        <Card className="flex-1 flex flex-col border-border bg-card">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-lg">Transcription Result</CardTitle>
                <CardDescription>
                  Clean audio transcription and word timestamps
                </CardDescription>
              </div>

              {transcriptionResult && (
                <div className="flex items-center gap-2">
                  <div className="flex rounded-lg bg-muted p-0.5 text-xs font-medium">
                    <button
                      onClick={() => setViewMode("plain")}
                      className={`px-3 py-1 rounded-md transition ${
                        viewMode === "plain"
                          ? "bg-background text-foreground shadow-xs font-semibold"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Normal Text
                    </button>
                    <button
                      onClick={() => setViewMode("interactive")}
                      className={`px-3 py-1 rounded-md transition ${
                        viewMode === "interactive"
                          ? "bg-background text-foreground shadow-xs font-semibold"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Timestamps
                    </button>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyEntireTranscript}
                    className="h-8 gap-1.5 text-xs"
                    title="Copy full text to clipboard"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        Copy
                      </>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadAsTxt}
                    className="h-8 gap-1.5 text-xs"
                    title="Download as plain text (.txt)"
                  >
                    <Download className="h-3.5 w-3.5" />
                    TXT
                  </Button>

                  {transcriptionResult.segments?.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadAsSrt}
                      className="h-8 gap-1.5 text-xs"
                      title="Download subtitles with timestamps (.srt)"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      SRT
                    </Button>
                  )}

                  {transcriptionResult.language && (
                    <div className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-semibold">
                      {transcriptionResult.language.toUpperCase()}
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto space-y-4">
            {!transcriptionResult ? (
              <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-muted-foreground">
                <FileAudio className="h-10 w-10 stroke-[1.2] mb-2" />
                <p className="text-sm">Upload and transcribe an audio file to see results here.</p>
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
  );
}
