"use client";

import { useVoiceWebSocket } from "hooks/useVoiceWebSocket";
import React, { useState, useRef, useEffect } from "react";

// Voice Visualizer Component - Modern Orb Style
const VoiceOrb = ({
  isListening,
  isRecording,
  amplitude = 0,
}: {
  isListening: boolean;
  isRecording: boolean;
  amplitude?: number;
}) => {
  const [pulseScale, setPulseScale] = useState(1);

  useEffect(() => {
    if (isListening) {
      const interval = setInterval(() => {
        setPulseScale(1 + Math.random() * 0.3);
      }, 200);
      return () => clearInterval(interval);
    } else {
      setPulseScale(1);
    }
  }, [isListening]);

  return (
    <div className="relative flex items-center justify-center w-48 h-48">
      {/* Outer glow rings */}
      {isRecording && (
        <>
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-600/20 animate-ping" />
          <div className="absolute inset-2 rounded-full bg-gradient-to-r from-blue-400/10 to-purple-500/10 animate-ping animation-delay-200" />
        </>
      )}

      {/* Dynamic middle ring that responds to voice */}
      <div
        className={`absolute rounded-full bg-gradient-to-r from-blue-400/30 to-purple-500/30 transition-all duration-300 ${
          isListening ? "animate-pulse" : ""
        }`}
        style={{
          width: `${120 * pulseScale}px`,
          height: `${120 * pulseScale}px`,
        }}
      />

      {/* Inner core orb */}
      <div
        className={`relative w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 
        ${isRecording ? "scale-100" : "scale-90"} 
        transition-all duration-500 shadow-2xl`}
        style={{
          boxShadow: isListening
            ? "0 0 60px rgba(139, 92, 246, 0.5), 0 0 100px rgba(59, 130, 246, 0.3)"
            : "0 10px 40px rgba(0, 0, 0, 0.3)",
        }}
      >
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 rounded-full overflow-hidden">
          <div
            className={`absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent 
            ${isListening ? "animate-shimmer" : ""}`}
          />
        </div>

        {/* Center dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className={`w-3 h-3 rounded-full bg-white 
            ${isListening ? "scale-150 opacity-100" : "scale-100 opacity-70"} 
            transition-all duration-200`}
          />
        </div>
      </div>
    </div>
  );
};

// Waveform bars visualization
const WaveformBars = ({ isListening }: { isListening: boolean }) => {
  const [bars, setBars] = useState([
    0.3, 0.5, 0.8, 0.6, 0.9, 0.7, 0.4, 0.6, 0.5,
  ]);

  useEffect(() => {
    if (isListening) {
      const interval = setInterval(() => {
        setBars(bars.map(() => 0.2 + Math.random() * 0.8));
      }, 100);
      return () => clearInterval(interval);
    } else {
      setBars(bars.map(() => 0.3));
    }
  }, [isListening]);

  return (
    <div className="flex items-center justify-center gap-1 h-12">
      {bars.map((height, i) => (
        <div
          key={i}
          className="w-1 bg-gradient-to-t from-blue-400 to-purple-500 rounded-full transition-all duration-150"
          style={{
            height: `${height * 48}px`,
            opacity: isListening ? 1 : 0.3,
          }}
        />
      ))}
    </div>
  );
};

// Icon Components
const Mic = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
    />
  </svg>
);

const Send = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
    />
  </svg>
);

const X = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

const User = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
  </svg>
);

const Bot = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
    />
  </svg>
);

const CheckCircle = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const Circle = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <circle cx="12" cy="12" r="10" strokeWidth={2} />
  </svg>
);

// Mock toast for demo
const toast = ({ title, description, variant }: any) => {
  console.log(`Toast: ${title} - ${description}`);
};

// Simple UI Components
const Button = ({
  children,
  onClick,
  disabled,
  variant = "default",
  size = "default",
  className = "",
}: any) => {
  const variants: any = {
    default:
      "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg",
    outline: "border-2 border-gray-700 hover:bg-gray-800 text-gray-200",
    ghost: "hover:bg-gray-800 text-gray-300",
    destructive: "bg-red-600 hover:bg-red-700 text-white",
  };

  const sizes: any = {
    sm: "px-3 py-2 text-sm",
    default: "px-4 py-2",
    lg: "px-6 py-3",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
};

const Textarea = React.forwardRef(
  (
    { value, onChange, onKeyPress, placeholder, disabled, className = "" }: any,
    ref: any
  ) => (
    <textarea
      ref={ref}
      value={value}
      onChange={onChange}
      onKeyPress={onKeyPress}
      placeholder={placeholder}
      disabled={disabled}
      className={`w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed resize-none ${className}`}
    />
  )
);

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  todos?: Array<{ id?: string; text: string; checked: boolean }>;
  isTranscribing?: boolean;
  action?: string;
}

interface VoiceIntent {
  action: "create" | "complete" | "update" | "delete" | "list";
  confidence: number;
  todoText?: string;
  targetTodo?: string;
  newText?: string;
}

interface VoiceCommandResponse {
  success: boolean;
  transcribedText?: string;
  intent?: VoiceIntent;
  result?: {
    success: boolean;
    message: string;
    todoId?: string;
    todos?: Array<{ id?: string; text: string; checked: boolean }>;
    stats?: {
      total: number;
      completed: number;
      incomplete: number;
    };
  };
  pageId?: string;
  needsSetup?: boolean;
  error?: string;
  audioResponse?: string;
}

export default function VoiceChat({ onNotionPageCreated, currentPageId }: any) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [language, setLanguage] = useState("en");
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [transcribingMessageId, setTranscribingMessageId] = useState<
    string | null
  >(null);
  const [activePageId, setActivePageId] = useState<string | undefined>(
    currentPageId
  );
  const [showVoiceModal, setShowVoiceModal] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();
  const recordingStartTime = useRef<number>(0);
  const silenceTimer = useRef<any>(null);

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
      if (recognition) {
        recognition.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Show the voice modal
      setShowVoiceModal(true);

      if (SpeechRecognition) {
        const speechRecognition = new SpeechRecognition();
        speechRecognition.continuous = true;
        speechRecognition.interimResults = true;
        speechRecognition.lang = language;

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
          setIsListening(fullTranscript.length > 0);

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === transcribingMessageId
                ? { ...msg, content: fullTranscript }
                : msg
            )
          );

          // Auto-stop after silence
          if (silenceTimer.current) {
            clearTimeout(silenceTimer.current);
          }

          if (fullTranscript.length > 0) {
            silenceTimer.current = setTimeout(() => {
              stopRecording();
            }, 2000);
          }
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
        if (recognition) {
          recognition.stop();
        }
        stream.getTracks().forEach((track) => track.stop());
        setIsListening(false);
        setShowVoiceModal(false);
      };

      setMediaRecorder(recorder);
      setAudioChunks([]);
      recordingStartTime.current = Date.now();
      recorder.start();
      setIsRecording(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      });
      setShowVoiceModal(false);
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
      setShowVoiceModal(false);

      if (transcribingMessageId) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === transcribingMessageId
              ? {
                  ...msg,
                  isTranscribing: false,
                  content:
                    currentTranscript || "🎤 Processing voice command...",
                }
              : msg
          )
        );
        setTranscribingMessageId(null);
      }

      if (currentTranscript) {
        processVoiceCommand(currentTranscript);
      }

      setIsProcessing(false);
      setAudioChunks([]);
      setCurrentTranscript("");
    }
  };

  const { isConnected, sendVoiceCommand, onMessage } = useVoiceWebSocket();

  useEffect(() => {
    onMessage("connected", (data) => {
      console.log("Connected:", data.message);
    });

    onMessage("transcription", (data) => {
      setCurrentTranscript(data.text);
      if (transcribingMessageId) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === transcribingMessageId
              ? { ...msg, content: data.text }
              : msg
          )
        );
      }
    });

    onMessage("result", (data) => {
      handleVoiceCommandResponse({
        success: data.success,
        intent: data.intent,
        result: data.result,
        pageId: data.pageId,
        needsSetup: data.needsSetup,
      });
      setIsProcessing(false);
    });

    onMessage("audio", (data) => {
      if (data.audio) {
        const audio = new Audio(`data:audio/mpeg;base64,${data.audio}`);
        audio
          .play()
          .catch((err) => console.error("Failed to play audio:", err));
      }
    });

    onMessage("error", (data) => {
      toast({
        title: "Error",
        description: data.message,
        variant: "destructive",
      });
      setIsProcessing(false);
    });
  }, [onMessage, transcribingMessageId]);

  const processVoiceCommand = async (text: string, audioBuffer?: string) => {
    if (!isConnected) {
      // Fallback to HTTP if WebSocket is not connected
      try {
        const response = await fetch("http://localhost:9999/api/v1/command", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text,
            audioBuffer,
            language,
            currentPageId: activePageId,
            returnAudio: true,
          }),
        });

        const data = await response.json();
        handleVoiceCommandResponse(data);
      } catch (error) {
        console.error("HTTP fallback error:", error);
      }
      return;
    }

    setIsProcessing(true);

    // Send via WebSocket
    sendVoiceCommand({
      text,
      audioBuffer,
      language,
      currentPageId: activePageId,
      returnAudio: true,
      voiceId: "EXAVITQu4vr4xnSDxMaL",
      modelId: "eleven_turbo_v2",
    });
  };

  const handleVoiceCommandResponse = (data: VoiceCommandResponse) => {
    const { intent, result, pageId } = data;

    if (pageId) {
      setActivePageId(pageId);
    }

    let messageContent = result?.message || "Command processed";
    let todos = result?.todos;

    if (intent?.action === "list" && result?.todos) {
      messageContent = `${result.message}\n${
        result.stats
          ? `(${result.stats.incomplete} pending, ${result.stats.completed} completed)`
          : ""
      }`;
    }

    const assistantMessage: Message = {
      id: Date.now().toString(),
      type: "assistant",
      content: messageContent,
      timestamp: new Date(),
      action: intent?.action,
      todos,
    };

    setMessages((prev) => [...prev, assistantMessage]);

    const actionIcons = {
      create: "✅ Added",
      complete: "☑️ Completed",
      update: "✏️ Updated",
      delete: "🗑️ Deleted",
      list: "📋 Listed",
    };

    if (intent?.action && result?.success) {
      toast({
        title: actionIcons[intent.action] || "Success",
        description: result.message,
      });
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
      await processVoiceCommand(currentInput);
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleTextSubmit();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      {/* TEST */}
      {/* Connection Status Bar */}
      <div className="border-b border-gray-700/50 bg-gray-900/70 px-4 py-2">
        <div className="max-w-4xl  flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              isConnected ? "bg-green-400" : "bg-red-400"
            } ${isConnected ? "animate-pulse" : "animate-ping"}`}
          />
          <span className="text-xs text-gray-400">
            {isConnected
              ? "Connected to voice server"
              : "Connecting to voice server..."}
          </span>
          {!isConnected && (
            <span className="text-xs text-gray-500">(Using HTTP fallback)</span>
          )}
        </div>
      </div>
      <div className="border-b border-gray-700/50 p-2 bg-gray-900/50 backdrop-blur-xl">
        <div className="max-w-4xl ">
          <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            AI Voice Assistant
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Speak naturally to manage your todos
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 mb-6">
                <Mic className="h-10 w-10 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-100 mb-3">
                Ready to assist you
              </h3>
              <p className="text-gray-400 max-w-md mx-auto mb-8">
                Click the microphone or type to manage your todos with natural
                language
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-2xl mx-auto">
                {[
                  "Add buy groceries",
                  "Complete first task",
                  "Show all todos",
                  "Delete last item",
                  "Update milk to oat milk",
                  "List pending tasks",
                ].map((example, i) => (
                  <div
                    key={i}
                    className="bg-gray-800/50 rounded-lg px-4 py-2 text-sm text-gray-400 border border-gray-700/50"
                  >
                    "{example}"
                  </div>
                ))}
              </div>
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
                className={`flex gap-3 max-w-2xl ${
                  message.type === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.type === "user"
                      ? "bg-gradient-to-br from-blue-500 to-purple-500"
                      : "bg-gradient-to-br from-gray-700 to-gray-600"
                  }`}
                >
                  {message.type === "user" ? (
                    <User className="h-4 w-4 text-white" />
                  ) : (
                    <Bot className="h-4 w-4 text-gray-300" />
                  )}
                </div>

                <div
                  className={`rounded-2xl px-5 py-3 ${
                    message.type === "user"
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                      : "bg-gray-800 text-gray-100 border border-gray-700"
                  }`}
                >
                  <p
                    className={`text-sm ${
                      message.isTranscribing ? "italic" : ""
                    }`}
                  >
                    {message.content}
                    {message.isTranscribing && (
                      <span className="inline-block w-1 h-4 ml-1 bg-current animate-pulse" />
                    )}
                  </p>

                  {message.todos && (
                    <div className="mt-3 space-y-2">
                      {message.todos.map((todo, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 p-2 rounded-lg bg-black/20 hover:bg-black/30 transition-colors"
                        >
                          <button className="flex-shrink-0">
                            {todo.checked ? (
                              <CheckCircle className="h-4 w-4 text-green-400" />
                            ) : (
                              <Circle className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                          <span
                            className={`text-sm ${
                              todo.checked ? "line-through opacity-60" : ""
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
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center">
                <Bot className="h-4 w-4 text-gray-300" />
              </div>
              <div className="bg-gray-800 rounded-2xl px-5 py-3 border border-gray-700">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce animation-delay-100" />
                    <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce animation-delay-200" />
                  </div>
                  <span className="text-sm text-gray-400">Processing...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-700/50 bg-gray-900/50 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <Textarea
                value={inputText}
                onChange={(e: any) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a command or click the mic to speak..."
                className="min-h-[50px] max-h-32"
                disabled={isProcessing || isRecording}
              />
            </div>

            <Button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isProcessing}
              variant={isRecording ? "destructive" : "default"}
              size="default"
              className="h-[50px] px-5"
            >
              <Mic className="h-5 w-5" />
            </Button>

            <Button
              onClick={handleTextSubmit}
              disabled={!inputText.trim() || isProcessing || isRecording}
              variant="outline"
              size="default"
              className="h-[50px] px-5"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Voice Recording Modal */}
      {showVoiceModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 shadow-2xl border border-gray-700 max-w-md w-full">
            <div className="flex flex-col items-center">
              <VoiceOrb isListening={isListening} isRecording={isRecording} />

              <div className="mt-6 text-center">
                <p className="text-xl font-semibold text-gray-100">
                  {isListening ? "Listening..." : "Speak now"}
                </p>
                <p className="text-sm text-gray-400 mt-2 min-h-[40px]">
                  {currentTranscript ||
                    "Say something like 'Add buy milk' or 'Show all todos'"}
                </p>
              </div>

              <WaveformBars isListening={isListening} />

              <Button
                onClick={stopRecording}
                variant="destructive"
                size="lg"
                className="mt-6 w-full rounded-xl"
              >
                <X className="h-5 w-5 mr-2" />
                Stop Recording
              </Button>

              <p className="text-xs text-gray-500 mt-3">
                Auto-stops after 2 seconds of silence
              </p>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%) translateY(-100%);
          }
          100% {
            transform: translateX(100%) translateY(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        .animation-delay-100 {
          animation-delay: 100ms;
        }
        .animation-delay-200 {
          animation-delay: 200ms;
        }
      `}</style>
    </div>
  );
}
