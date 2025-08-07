"use client";

import { toast } from "hooks/use-toast";
import React, { useState, useRef, useEffect } from "react";

/**
 * Play a Base‑64‑encoded audio string (data *without* the “data:audio/…” prefix).
 * 
 */
interface VoiceCommandResponse {
  /* …existing fields… */
  audioResponse?: string;   // ← Base‑64 WAV (or MP3) from the API
}


// Icon Components
const Mic = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
  </svg>
);

const Send = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);

const Square = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeWidth={2} />
  </svg>
);

const User = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const Bot = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const CheckCircle = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const Circle = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <circle cx="12" cy="12" r="10" strokeWidth={2} />
  </svg>
);

const List = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const Plus = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const Trash2 = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const Edit = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);
// Simple UI Components
const Button = ({ children, onClick, disabled, variant = "default", size = "default", className = "" }: any) => {
  const variants: any = {
    default: "bg-blue-600 hover:bg-blue-700 text-white",
    outline: "border border-gray-300 hover:bg-gray-100",
    destructive: "bg-red-600 hover:bg-red-700 text-white"
  };

  const sizes: any = {
    sm: "px-3 py-2 text-sm",
    default: "px-4 py-2"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
};

const Textarea = React.forwardRef(({ value, onChange, onKeyPress, placeholder, disabled, className = "" }: any, ref: any) => (
  <textarea
    ref={ref}
    value={value}
    onChange={onChange}
    onKeyPress={onKeyPress}
    placeholder={placeholder}
    disabled={disabled}
    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
  />
));

const Select = ({ value, onValueChange, children }: any) => {
  return (
    <select
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {React.Children.map(children, (child: any) => {
        if (child?.props?.children) {
          return React.Children.map(child.props.children, (option: any) => (
            <option key={option.props.value} value={option.props.value}>
              {option.props.children}
            </option>
          ));
        }
        return null;
      })}
    </select>
  );
};

const SelectTrigger = ({ children, className }: any) => <>{children}</>;
const SelectContent = ({ children }: any) => <>{children}</>;
const SelectItem = ({ value, children }: any) => <option value={value}>{children}</option>;
const SelectValue = () => null;

const Card = ({ children, className = "" }: any) => (
  <div className={`bg-white rounded-lg shadow-md border border-gray-200 ${className}`}>
    {children}
  </div>
);

const CardContent = ({ children, className = "" }: any) => (
  <div className={`p-4 ${className}`}>
    {children}
  </div>
);

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  todos?: Array<{ id?: string; text: string; checked: boolean }>;
  title?: string;
  language?: string;
  isTranscribing?: boolean;
  notionUrl?: string;
  intent?: VoiceIntent;
  action?: string;
}

interface Todo {
  id?: string;
  text: string;
  checked: boolean;
}

interface VoiceIntent {
  action: 'create' | 'complete' | 'update' | 'delete' | 'list';
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
    todos?: Todo[];
    stats?: {
      total: number;
      completed: number;
      incomplete: number;
    };
  };
  pageId?: string;
  needsSetup?: boolean;
  error?: string;
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
  userId?: string;
  currentPageId?: string;
}

export default function VoiceChat({
  onNotionPageCreated,
  userId = "default-user",
  currentPageId
}: VoiceChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [language, setLanguage] = useState("en");
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [silenceTimer, setSilenceTimer] = useState<NodeJS.Timeout | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [transcribingMessageId, setTranscribingMessageId] = useState<string | null>(null);
  const [activePageId, setActivePageId] = useState<string | undefined>(currentPageId);
  const [isCommandMode, setIsCommandMode] = useState(true); // Toggle between command mode and create mode

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

  useEffect(() => {
    setActivePageId(currentPageId);
  }, [currentPageId]);

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

    const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
    const decibels = 20 * Math.log10(average / 255);

    const isSpeaking = decibels > SILENCE_THRESHOLD;
    const currentTime = Date.now();
    const recordingDuration = currentTime - recordingStartTime.current;

    if (isSpeaking) {
      setIsListening(true);
      if (silenceTimer) {
        clearTimeout(silenceTimer);
        setSilenceTimer(null);
      }
    } else if (isListening && recordingDuration > MIN_RECORDING_TIME) {
      if (!silenceTimer) {
        const timer = setTimeout(() => {
          stopRecording();
        }, SILENCE_DURATION);
        setSilenceTimer(timer);
      }
    }

    animationFrameRef.current = requestAnimationFrame(analyzeAudio);
  };

  const startRecording = async () => {
    try {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        toast({
          title: "Speech Recognition Not Supported",
          description: "Your browser does not support real-time transcription. Recording will still work.",
          variant: "destructive",
        });
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const audioCtx = new ((window as any).AudioContext ||
        (window as any).webkitAudioContext)();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyserNode = audioCtx.createAnalyser();

      analyserNode.fftSize = 256;
      analyserNode.smoothingTimeConstant = 0.8;
      source.connect(analyserNode);

      setAudioContext(audioCtx);
      setAnalyser(analyserNode);

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

      recorder.onstop = async () => {
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

        // Process the audio
        if (audioChunks.length > 0) {
          const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
          await processAudioCommand(audioBlob);
        }
      };

      setMediaRecorder(recorder);
      setAudioChunks([]);
      recordingStartTime.current = Date.now();
      recorder.start();
      setIsRecording(true);

      analyzeAudio();

      toast({
        title: isCommandMode ? "Voice Command Mode" : "Create Todo Mode",
        description: isCommandMode
          ? "Say a command like 'add buy milk', 'complete first', or 'show todos'"
          : "Speak your todo list... Recording will stop automatically when you finish.",
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

      if (silenceTimer) {
        clearTimeout(silenceTimer);
        setSilenceTimer(null);
      }

      if (transcribingMessageId) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === transcribingMessageId
              ? {
                ...msg,
                isTranscribing: false,
                content: currentTranscript || "🎤 Processing voice command...",
              }
              : msg
          )
        );
        setTranscribingMessageId(null);
      }

      // Directly process the command with just the transcript
      if (currentTranscript && isCommandMode) {
        processVoiceCommand(currentTranscript);
      } else if (currentTranscript && !isCommandMode) {
        processCreateTodoPage(currentTranscript);
      }

      setIsProcessing(false);
      setAudioChunks([]);
      setCurrentTranscript("");
    }
  };

  const processAudioCommand = async (audioBlob: Blob) => {
    try {
      // If we have transcript from speech recognition, use it directly
      if (isCommandMode && currentTranscript) {
        // Just send the text without audio if we have it
        await processVoiceCommand(currentTranscript);
        return;
      }

      // Otherwise try to convert audio
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);

      reader.onloadend = async () => {
        const base64Audio = reader.result?.toString().split(',')[1];

        if (isCommandMode) {
          // Send with audio buffer if available
          await processVoiceCommand(currentTranscript || "", base64Audio);
        } else {
          await processCreateTodoPage(currentTranscript);
        }
      };
    } catch (error) {
      console.error("Error processing audio:", error);
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

  const processVoiceCommand = async (text: string, audioBuffer?: string) => {
    try {
      const response = await fetch(
        "http://localhost:9999/api/v1/command",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: text || undefined,
            audioBuffer,
            language,
            userId,
            currentPageId: activePageId,
            returnAudio: true, // ✅ Ensure this is true
            voiceId: "EXAVITQu4vr4xnSDxMaL", // optional
            modelId: "eleven_turbo_v2",     // optional
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to process voice command");
      }

      const data: VoiceCommandResponse = await response.json();

      console.log(data, "___data_audioResponse")

      if (data.audioResponse) {
        const audio = new Audio(`data:audio/mpeg;base64,${data.audioResponse}`);
        audio.play().catch(err => {
          console.error("Failed to play audio:", err);
        });
      }


      if (data.success) {
        handleVoiceCommandResponse(data);
      } else if (data.needsSetup) {
        // Need to create a page first
        const assistantMessage: Message = {
          id: Date.now().toString(),
          type: "assistant",
          content: data.result?.message || "No todo list found. Please create one first by switching to Create Mode.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error(data.error || "Command failed");
      }
    } catch (error) {
      console.error("Voice command error:", error);
      toast({
        title: "Error",
        description: "Failed to process voice command.",
        variant: "destructive",
      });
    }
  };

  const processCreateTodoPage = async (transcript: string) => {
    if (!transcript.trim()) {
      setIsProcessing(false);
      return;
    }

    try {
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
        handleApiResponse("Voice Tasks", data.todos || [], data.notionUrl, data.pageId);
      } else {
        throw new Error("Failed to create todo");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process voice recording.",
        variant: "destructive",
      });
    }
  };

  const handleVoiceCommandResponse = (data: VoiceCommandResponse) => {
    const { intent, result, pageId, transcribedText } = data;

    if (pageId) {
      setActivePageId(pageId);
    }

    // Create assistant message based on the action
    let messageContent = result?.message || "Command processed";
    let todos: Todo[] | undefined;

    if (intent?.action === 'list' && result?.todos) {
      todos = result.todos;
      messageContent = `${result.message}\n${result.stats ? `(${result.stats.incomplete} pending, ${result.stats.completed} completed)` : ''}`;
    }

    const assistantMessage: Message = {
      id: Date.now().toString(),
      type: "assistant",
      content: messageContent,
      timestamp: new Date(),
      intent,
      action: intent?.action,
      todos,
    };

    setMessages((prev) => [...prev, assistantMessage]);

    // Show appropriate icon based on action
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
      if (isCommandMode) {
        // Process as voice command
        await processVoiceCommand(currentInput);
      } else {
        // Process as todo page creation
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
          handleApiResponse("Quick Tasks", data.todos || [], data.notionUrl, data.pageId);
        } else {
          throw new Error("Failed to create todo");
        }
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
    notionUrl?: string,
    pageId?: string
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

    if (pageId) {
      setActivePageId(pageId);
    }

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

  const getActionIcon = (action?: string) => {
    switch (action) {
      case 'create':
        return <Plus className="h-3 w-3" />;
      case 'complete':
        return <CheckCircle className="h-3 w-3" />;
      case 'update':
        return <Edit className="h-3 w-3" />;
      case 'delete':
        return <Trash2 className="h-3 w-3" />;
      case 'list':
        return <List className="h-3 w-3" />;
      default:
        return null;
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
              {isCommandMode ? "Voice commands for todos" : "Create todo lists with voice or text"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={isCommandMode ? "default" : "outline"}
              size="sm"
              onClick={() => setIsCommandMode(!isCommandMode)}
            >
              {isCommandMode ? "Command Mode" : "Create Mode"}
            </Button>
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
        {activePageId && (
          <div className="mt-2 text-xs text-muted-foreground">
            Active Page: {activePageId.slice(0, 8)}...
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <Mic className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {isCommandMode ? "Voice Command Mode" : "Start creating your todo list"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {isCommandMode
                ? "Use commands like: 'add buy groceries', 'complete first todo', 'show all todos'"
                : "Use voice recording, type your tasks, or speak naturally about what you need to do."}
            </p>
            {isCommandMode && (
              <Card className="max-w-md mx-auto bg-gray-900 border-gray-700">
                <CardContent className="pt-6">
                  <div className="space-y-2 text-sm text-left">
                    <div className="flex items-center gap-2">
                      <Plus className="h-4 w-4 text-green-400" />
                      <span className="text-gray-200">"Add [task]" - Create new todo</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-400" />
                      <span className="text-gray-200">"Complete [first/last/task name]" - Mark as done</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Edit className="h-4 w-4 text-yellow-400" />
                      <span className="text-gray-200">"Update [task] to [new text]" - Edit todo</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Trash2 className="h-4 w-4 text-red-400" />
                      <span className="text-gray-200">"Delete [task]" - Remove todo</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <List className="h-4 w-4 text-purple-400" />
                      <span className="text-gray-200">"Show todos" - List all tasks</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.type === "user" ? "justify-end" : "justify-start"
              }`}
          >
            <div
              className={`flex gap-3 max-w-3xl ${message.type === "user" ? "flex-row-reverse" : "flex-row"
                }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.type === "user" ? "bg-primary" : "bg-muted"
                  }`}
              >
                {message.type === "user" ? (
                  <User className="h-4 w-4 text-primary-foreground" />
                ) : (
                  <Bot className="h-4 w-4 text-muted-foreground" />
                )}
              </div>

              <div
                className={`rounded-2xl px-4 py-3 ${message.type === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
                  }`}
              >
                {message.action && (
                  <div className="flex items-center gap-1 mb-1 opacity-75">
                    {getActionIcon(message.action)}
                    <span className="text-xs font-medium capitalize">
                      {message.action} Action
                    </span>
                  </div>
                )}
                <p
                  className={`text-sm ${message.isTranscribing ? "typewriter" : ""
                    }`}
                >
                  {message.content}
                  {message.isTranscribing && (
                    <span className="animate-pulse">|</span>
                  )}
                </p>

                {message.todos && (
                  <div className="mt-3 space-y-2">
                    {message.title && (
                      <div className="text-xs font-medium opacity-75 mb-2">
                        {message.title} •{" "}
                        {LANGUAGES.find((l) => l.code === message.language)?.name}
                      </div>
                    )}
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
                          className={`text-sm ${todo.checked ? "line-through opacity-75" : ""
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
              onChange={(e: any) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                isCommandMode
                  ? "Type a command like 'add buy milk' or 'show todos'..."
                  : "Type your todo list or describe what you need to do..."
              }
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
              className={`w-2 h-2 rounded-full ${isListening
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