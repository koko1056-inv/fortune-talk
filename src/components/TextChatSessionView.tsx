import { useRef, useEffect, useState, memo, useCallback } from "react";
import { X, Loader2, Send, Sparkles, MessageSquare, Keyboard } from "lucide-react";
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
    <div className="fixed inset-0 z-50 flex flex-col overflow-hidden">
      {/* Mystical gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[hsl(270,50%,8%)] via-[hsl(260,40%,12%)] to-[hsl(250,35%,10%)]" />
      
      {/* Subtle sparkle overlay */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-1 h-1 bg-primary/60 rounded-full animate-pulse" />
        <div className="absolute top-40 right-20 w-1.5 h-1.5 bg-primary/40 rounded-full animate-pulse delay-300" />
        <div className="absolute bottom-40 left-1/4 w-1 h-1 bg-primary/50 rounded-full animate-pulse delay-700" />
      </div>

      {/* Header */}
      <div className="relative flex items-center justify-between px-4 py-3 border-b border-primary/20 shrink-0 bg-background/30 backdrop-blur-md">
        <div className="flex items-center gap-3">
          {/* Agent avatar with glow */}
          <div className="relative">
            <div className="absolute inset-0 bg-primary/30 rounded-full blur-md animate-pulse" />
            <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/40 flex items-center justify-center text-xl shadow-lg">
              {agent.emoji}
            </div>
          </div>
          
          {/* Agent info with LIVE badge */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">{agent.name}</span>
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-primary/20 border border-primary/30">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-medium text-primary">LIVE</span>
              </div>
            </div>
            {displayName && (
              <span className="text-xs text-muted-foreground">{displayName}さんとセッション中</span>
            )}
          </div>
        </div>
        
        {/* End button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onLeave}
          className="h-9 w-9 rounded-full bg-muted/30 hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Main chat area */}
      <div className="relative flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Messages */}
        <ScrollArea className="flex-1 px-4 py-4" ref={scrollRef}>
          {isConnecting || (isSending && messages.length === 0) ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
                <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-primary animate-pulse" />
                </div>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>占い師と接続中...</span>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
                <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center text-2xl">
                  {agent.emoji}
                </div>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>メッセージを待っています...</span>
              </div>
            </div>
          ) : (
            <div className="space-y-4 pb-2">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-2",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {/* Agent avatar for assistant messages */}
                  {message.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center text-sm shrink-0 mt-1">
                      {agent.emoji}
                    </div>
                  )}
                  
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-lg",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted/60 text-foreground border border-border/30 rounded-bl-md backdrop-blur-sm"
                    )}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              {isSending && (
                <div className="flex gap-2 justify-start">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center text-sm shrink-0">
                    {agent.emoji}
                  </div>
                  <div className="bg-muted/60 border border-border/30 rounded-2xl rounded-bl-md px-4 py-3 backdrop-blur-sm">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Input area */}
        {!isRallyLimitReached && messages.length > 0 && !isSending && (
          <div className="border-t border-primary/20 p-4 space-y-3 shrink-0 bg-background/60 backdrop-blur-md">
            {hasChoices && (
              <>
                <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1.5">
                  <Sparkles className="w-3 h-3" />
                  選択肢をタップするか、自由に入力してください
                </p>
                <div className="space-y-2">
                  {choices.map((choice, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="w-full justify-start text-left h-auto py-3 px-4 whitespace-normal bg-muted/30 border-primary/20 hover:bg-primary/10 hover:border-primary/40 transition-all"
                      onClick={() => onChoiceSelect(choice)}
                    >
                      <MessageSquare className="w-4 h-4 mr-3 shrink-0 text-primary/70" />
                      <span className="text-sm">{choice}</span>
                    </Button>
                  ))}
                </div>

                {!showTextInput ? (
                  <Button
                    variant="ghost"
                    className="w-full text-muted-foreground text-xs hover:text-primary"
                    onClick={() => setShowTextInput(true)}
                  >
                    <Keyboard className="w-3 h-3 mr-1.5" />
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
                  className="min-h-[44px] max-h-[80px] resize-none bg-muted/30 border-primary/20 text-sm focus:border-primary/40"
                />
                <Button
                  onClick={handleSubmit}
                  disabled={!inputValue.trim()}
                  size="icon"
                  className="shrink-0 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
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
        <div className="relative border-t border-primary/20 px-4 py-2.5 shrink-0 bg-background/40 backdrop-blur-md">
          <div className="flex items-center justify-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
              <Sparkles className="w-3 h-3 text-primary/70" />
              <span className="text-xs text-muted-foreground">ラリー</span>
              <span className="text-sm font-semibold text-primary">{rallyCount}</span>
              <span className="text-xs text-muted-foreground">/</span>
              <span className="text-xs text-muted-foreground">{maxRallies}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

TextChatSessionView.displayName = "TextChatSessionView";

export default TextChatSessionView;
