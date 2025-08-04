"use client";

import React, { useState, useRef, useEffect } from "react";

import {
  Mic,
  MicOff,
  Send,
  Square,
  User,
  Bot,
  CheckCircle,
  Circle,
} from "lucide-react";
import { toast } from "hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  todos?: Array<{ text: string; checked: boolean }>;
  title?: string;
  language?: string;
  isTranscribing?: boolean;
  notionUrl?: string;
}

interface Todo {
  text: string;
  checked: boolean;
}

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "ru", name: "Russian" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "zh", name: "Chinese" },
  { code: "ar", name: "Arabic" },
  { code: "hi", name: "Hindi" },
];

interface VoiceChatProps {
  onNotionPageCreated?: (pageUrl: string) => void;
}

export default function VoiceChat({ onNotionPageCreated }: VoiceChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [language, setLanguage] = useState("en");
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [silenceTimer, setSilenceTimer] = useState<NodeJS.Timeout | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(
    null
  );
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [transcribingMessageId, setTranscribingMessageId] = useState<
    string | null
  >(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const animationFrameRef = useRef<number>();

  // Voice Activity Detection settings
  const SILENCE_THRESHOLD = -50; // dB
  const SILENCE_DURATION = 2000; // ms
  const MIN_RECORDING_TIME = 1000; // ms
  const recordingStartTime = useRef<number>(0);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (silenceTimer) {
        clearTimeout(silenceTimer);
      }
      if (audioContext) {
        audioContext.close();
      }
      if (recognition) {
        recognition.stop();
      }
    };
  }, []);

  const analyzeAudio = () => {
    if (!analyser || !isRecording) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    // Calculate average volume
    const average =
      dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
    const decibels = 20 * Math.log10(average / 255);

    const isSpeaking = decibels > SILENCE_THRESHOLD;
    const currentTime = Date.now();
    const recordingDuration = currentTime - recordingStartTime.current;

    if (isSpeaking) {
      setIsListening(true);
      // Clear any existing silence timer
      if (silenceTimer) {
        clearTimeout(silenceTimer);
        setSilenceTimer(null);
      }
    } else if (isListening && recordingDuration > MIN_RECORDING_TIME) {
      // Start silence timer if not already started
      if (!silenceTimer) {
        const timer = setTimeout(() => {
          stopRecording();
        }, SILENCE_DURATION);
        setSilenceTimer(timer);
      }
    }

    // Continue analyzing
    animationFrameRef.current = requestAnimationFrame(analyzeAudio);
  };

  const startRecording = async () => {
    try {
      // Check if browser supports speech recognition
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        toast({
          title: "Speech Recognition Not Supported",
          description:
            "Your browser does not support real-time transcription. Recording will still work.",
          variant: "destructive",
        });
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Set up audio analysis
      const audioCtx = new ((window as any).AudioContext ||
        (window as any).webkitAudioContext)();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyserNode = audioCtx.createAnalyser();

      analyserNode.fftSize = 256;
      analyserNode.smoothingTimeConstant = 0.8;
      source.connect(analyserNode);

      setAudioContext(audioCtx);
      setAnalyser(analyserNode);

      // Set up speech recognition for real-time transcription
      if (SpeechRecognition) {
        const speechRecognition = new SpeechRecognition();
        speechRecognition.continuous = true;
        speechRecognition.interimResults = true;
        speechRecognition.lang = language;

        // Create a transcribing message
        const transcribingMessageId = Date.now().toString();
        const transcribingMessage: Message = {
          id: transcribingMessageId,
          type: "user",
          content: "",
          timestamp: new Date(),
          isTranscribing: true,
        };

        setMessages((prev) => [...prev, transcribingMessage]);
        setTranscribingMessageId(transcribingMessageId);
        setCurrentTranscript("");

        speechRecognition.onresult = (event: any) => {
          let finalTranscript = "";
          let interimTranscript = "";

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }

          const fullTranscript = finalTranscript + interimTranscript;
          setCurrentTranscript(fullTranscript);

          // Update the transcribing message
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === transcribingMessageId
                ? { ...msg, content: fullTranscript }
                : msg
            )
          );
        };

        speechRecognition.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
        };

        speechRecognition.start();
        setRecognition(speechRecognition);
      }

      const recorder = new MediaRecorder(stream);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setAudioChunks((prev) => [...prev, event.data]);
        }
      };

      recorder.onstop = () => {
        // Clean up audio analysis
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        if (audioCtx) {
          audioCtx.close();
        }
        if (recognition) {
          recognition.stop();
        }
        stream.getTracks().forEach((track) => track.stop());
        setIsListening(false);
        if (silenceTimer) {
          clearTimeout(silenceTimer);
          setSilenceTimer(null);
        }
      };

      setMediaRecorder(recorder);
      setAudioChunks([]);
      recordingStartTime.current = Date.now();
      recorder.start();
      setIsRecording(true);

      // Start audio analysis
      analyzeAudio();

      toast({
        title: "Recording started",
        description:
          "Speak your todo list... Recording will stop automatically when you finish.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      if (recognition) {
        recognition.stop();
        setRecognition(null);
      }
      setIsRecording(false);
      setIsProcessing(true);

      // Clean up timers
      if (silenceTimer) {
        clearTimeout(silenceTimer);
        setSilenceTimer(null);
      }

      // Finalize the transcribing message
      if (transcribingMessageId) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === transcribingMessageId
              ? {
                  ...msg,
                  isTranscribing: false,
                  content: currentTranscript || "🎤 Voice recording processed",
                }
              : msg
          )
        );
        setTranscribingMessageId(null);
      }

      // Process the transcribed text
      setTimeout(() => {
        processTranscribedText(currentTranscript);
      }, 1000);
    }
  };

  const processTranscribedText = async (transcript: string) => {
    if (!transcript.trim()) {
      setIsProcessing(false);
      return;
    }

    try {
      // Send transcribed text to API
      const response = await fetch(
        "http://localhost:9999/api/v1/create-todo-page",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: "Voice Tasks",
            content: transcript,
            language,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        handleApiResponse("Voice Tasks", data.todos || [], data.notionUrl);
      } else {
        throw new Error("Failed to create todo");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process voice recording.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setAudioChunks([]);
      setCurrentTranscript("");
    }
  };

  const handleTextSubmit = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = inputText;
    setInputText("");
    setIsProcessing(true);

    try {
      const response = await fetch(
        "http://localhost:9999/api/v1/create-todo-page",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: "Quick Tasks",
            content: currentInput,
            language,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        handleApiResponse("Quick Tasks", data.todos || [], data.notionUrl);
      } else {
        throw new Error("Failed to create todo");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process your request.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApiResponse = (
    title: string,
    todos: Todo[],
    notionUrl?: string
  ) => {
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: "assistant",
      content: `Created todo list: "${title}"`,
      timestamp: new Date(),
      todos,
      title,
      language,
      notionUrl,
    };

    setMessages((prev) => [...prev, assistantMessage]);

    if (notionUrl && onNotionPageCreated) {
      onNotionPageCreated(notionUrl);
    }

    toast({
      title: "Success!",
      description: "Todo list created in Notion.",
    });
  };

  const toggleTodo = (messageId: string, todoIndex: number) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === messageId && msg.todos) {
          const updatedTodos = [...msg.todos];
          updatedTodos[todoIndex] = {
            ...updatedTodos[todoIndex],
            checked: !updatedTodos[todoIndex].checked,
          };
          return { ...msg, todos: updatedTodos };
        }
        return msg;
      })
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleTextSubmit();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-border p-4 bg-card/50 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Voice Chat
            </h2>
            <p className="text-sm text-muted-foreground">
              Create todo lists with voice or text
            </p>
          </div>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <Mic className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Start creating your todo list
            </h3>
            <p className="text-muted-foreground">
              Use voice recording, type your tasks, or speak naturally about
              what you need to do.
            </p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${
              message.type === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`flex gap-3 max-w-3xl ${
                message.type === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.type === "user" ? "bg-primary" : "bg-muted"
                }`}
              >
                {message.type === "user" ? (
                  <User className="h-4 w-4 text-primary-foreground" />
                ) : (
                  <Bot className="h-4 w-4 text-muted-foreground" />
                )}
              </div>

              <div
                className={`rounded-2xl px-4 py-3 ${
                  message.type === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <p
                  className={`text-sm ${
                    message.isTranscribing ? "typewriter" : ""
                  }`}
                >
                  {message.content}
                  {message.isTranscribing && (
                    <span className="animate-pulse">|</span>
                  )}
                </p>

                {message.todos && (
                  <div className="mt-3 space-y-2">
                    <div className="text-xs font-medium opacity-75 mb-2">
                      {message.title} •{" "}
                      {LANGUAGES.find((l) => l.code === message.language)?.name}
                    </div>
                    {message.todos.map((todo, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2 rounded-lg bg-background/10 hover:bg-background/20 transition-colors"
                      >
                        <button
                          onClick={() => toggleTodo(message.id, index)}
                          className="flex-shrink-0"
                        >
                          {todo.checked ? (
                            <CheckCircle className="h-4 w-4 text-green-400" />
                          ) : (
                            <Circle className="h-4 w-4 text-muted-foreground" />
                          )}
                        </button>
                        <span
                          className={`text-sm ${
                            todo.checked ? "line-through opacity-75" : ""
                          }`}
                        >
                          {todo.text}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {isProcessing && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
              <Bot className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="bg-muted rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-muted-foreground border-t-transparent"></div>
                <span className="text-sm text-muted-foreground">
                  Processing...
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-border p-4 bg-card/50">
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <Textarea
              ref={textareaRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your todo list or describe what you need to do..."
              className="min-h-[44px] max-h-32 resize-none"
              disabled={isProcessing || isRecording}
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isProcessing}
              variant={isRecording ? "destructive" : "outline"}
              size="sm"
              className="h-11 w-11 p-0"
            >
              {isRecording ? (
                <Square className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>

            <Button
              onClick={handleTextSubmit}
              disabled={!inputText.trim() || isProcessing || isRecording}
              size="sm"
              className="h-11 w-11 p-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {isRecording && (
          <div className="mt-2 flex items-center gap-2 text-sm text-destructive">
            <div
              className={`w-2 h-2 rounded-full ${
                isListening
                  ? "bg-green-500 animate-pulse"
                  : "bg-destructive animate-pulse"
              }`}
            ></div>
            {isListening
              ? "Listening & transcribing..."
              : "Recording... (waiting for speech)"}
            <span className="text-xs text-muted-foreground ml-2">
              Auto-stops after 2s of silence
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
