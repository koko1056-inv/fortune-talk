import { memo, useState, useCallback } from "react";
import { Send, Loader2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputProps {
  choices?: string[];
  onChoiceSelect: (choice: string) => void;
  onCustomInput: (input: string) => void;
  isSending: boolean;
  disabled?: boolean;
}

const ChatInput = memo(({
  choices,
  onChoiceSelect,
  onCustomInput,
  isSending,
  disabled = false,
}: ChatInputProps) => {
  const [inputValue, setInputValue] = useState("");
  const [showTextInput, setShowTextInput] = useState(false);

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

  if (disabled) return null;

  return (
    <div className="border-t border-border/30 p-3 space-y-2">
      {hasChoices && (
        <>
          <p className="text-xs text-muted-foreground text-center mb-2">
            選択肢を選ぶか、自由に入力してください
          </p>
          <div className="space-y-2">
            {choices.map((choice, index) => (
              <Button
                key={index}
                variant="outline"
                className="w-full justify-start text-left h-auto py-3 px-4 whitespace-normal"
                onClick={() => onChoiceSelect(choice)}
                disabled={isSending}
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
        <div className="flex gap-2 mt-2">
          <Textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="質問を入力してください..."
            className="min-h-[44px] max-h-[80px] resize-none bg-background/50 text-sm"
            disabled={isSending}
          />
          <Button
            onClick={handleSubmit}
            disabled={!inputValue.trim() || isSending}
            size="icon"
            className="shrink-0"
          >
            {isSending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      )}
    </div>
  );
});

ChatInput.displayName = "ChatInput";

export default ChatInput;
