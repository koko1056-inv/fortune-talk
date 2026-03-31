import { Mic, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

export type ChatMode = "voice" | "text";

interface ChatModeToggleProps {
  mode: ChatMode;
  onChange: (mode: ChatMode) => void;
  disabled?: boolean;
}

const ChatModeToggle = ({ mode, onChange, disabled }: ChatModeToggleProps) => {
  return (
    <div className="flex items-center gap-1 p-1 rounded-full glass-surface">
      <button
        onClick={() => onChange("voice")}
        disabled={disabled}
        className={cn(
          "touch-target gap-2 px-5 rounded-full text-sm font-medium transition-all duration-300",
          mode === "voice"
            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
            : "text-muted-foreground hover:text-foreground",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <Mic className="w-4 h-4" />
        <span className="hidden sm:inline">音声</span>
      </button>
      <button
        onClick={() => onChange("text")}
        disabled={disabled}
        className={cn(
          "touch-target gap-2 px-5 rounded-full text-sm font-medium transition-all duration-300",
          mode === "text"
            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
            : "text-muted-foreground hover:text-foreground",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <MessageSquare className="w-4 h-4" />
        <span className="hidden sm:inline">テキスト</span>
      </button>
    </div>
  );
};

export default ChatModeToggle;
