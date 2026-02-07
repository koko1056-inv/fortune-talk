import { useRef, useEffect, useState, memo, useCallback } from "react";
import { PhoneOff, Loader2, Send, MessageCircle } from "lucide-react";
import { Agent } from "./AgentSelector";
import { Message } from "./ChatMessages";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface TextChatSessionViewProps {
  agent: Agent;
  displayName?: string | null;
  isConnecting?: boolean;
  rallyCount?: number;
  maxRallies?: number;
  showRallyCounter?: boolean;
  onLeave?: () => void;
  messages: Message[];
  isSending: boolean;
  choices?: string[];
  onChoiceSelect: (choice: string) => void;
  onCustomInput: (text: string) => void;
  isRallyLimitReached: boolean;
}

const TextChatSessionView = memo(({
  agent,
  displayName,
  isConnecting,
  rallyCount = 0,
  maxRallies = 10,
  showRallyCounter = true,
  onLeave,
  messages,
  isSending,
  choices,
  onChoiceSelect,
  onCustomInput,
  isRallyLimitReached,
}: TextChatSessionViewProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState("");
  const [showTextInput, setShowTextInput] = useState(false);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isSending]);

  const handleSubmit = useCallback(() => {
    if (!inputValue.trim()) return;
    onCustomInput(inputValue.trim());
    setInputValue("");
    setShowTextInput(false);
  }, [inputValue, onCustomInput]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const hasChoices = choices && choices.length > 0;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-background via-background/95 to-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/30 shrink-0">
        <div className="flex items-center gap-3">
          {/* LIVE Badge */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-destructive/20 border border-destructive/30">
            <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
            <span className="text-xs font-medium text-destructive">LIVE</span>
          </div>
          
          {/* Agent info */}
          <div className="flex items-center gap-2">
            <span className="text-lg">{agent.emoji}</span>
            <span className="text-sm font-medium text-foreground/90">{agent.name}</span>
          </div>
        </div>
        
        {/* End button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onLeave}
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <PhoneOff className="w-4 h-4 mr-1" />
          終了
        </Button>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Messages */}
        <ScrollArea className="flex-1 px-4 py-4" ref={scrollRef}>
          {isConnecting || (isSending && messages.length === 0) ? (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              占い師と接続中...
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              メッセージを待っています...
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-3 text-sm",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/50 text-foreground"
                    )}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              {isSending && (
                <div className="flex justify-start">
                  <div className="bg-muted/50 rounded-2xl px-4 py-3">
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Input area */}
        {!isRallyLimitReached && messages.length > 0 && !isSending && (
          <div className="border-t border-border/30 p-4 space-y-3 shrink-0 bg-background/80 backdrop-blur-sm">
            {hasChoices && (
              <>
                <p className="text-xs text-muted-foreground text-center">
                  選択肢を選ぶか、自由に入力してください
                </p>
                <div className="space-y-2">
                  {choices.map((choice, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="w-full justify-start text-left h-auto py-3 px-4 whitespace-normal"
                      onClick={() => onChoiceSelect(choice)}
                    >
                      <MessageCircle className="w-4 h-4 mr-2 shrink-0" />
                      <span className="text-sm">{choice}</span>
                    </Button>
                  ))}
                </div>

                {!showTextInput ? (
                  <Button
                    variant="ghost"
                    className="w-full text-muted-foreground text-xs"
                    onClick={() => setShowTextInput(true)}
                  >
                    その他（自由入力）
                  </Button>
                ) : null}
              </>
            )}

            {(!hasChoices || showTextInput) && (
              <div className="flex gap-2">
                <Textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="質問を入力してください..."
                  className="min-h-[44px] max-h-[80px] resize-none bg-background/50 text-sm"
                />
                <Button
                  onClick={handleSubmit}
                  disabled={!inputValue.trim()}
                  size="icon"
                  className="shrink-0"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer with rally counter */}
      {showRallyCounter && (
        <div className="border-t border-border/30 px-4 py-2 shrink-0">
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <span>ラリー</span>
            <span className="font-medium text-foreground">{rallyCount}</span>
            <span>/</span>
            <span>{maxRallies}</span>
          </div>
        </div>
      )}
    </div>
  );
});

TextChatSessionView.displayName = "TextChatSessionView";

export default TextChatSessionView;
