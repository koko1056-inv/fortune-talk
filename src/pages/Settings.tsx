import { Link, Navigate } from "react-router-dom";
import { ArrowLeft, RotateCcw, Check, AlertCircle, Upload, X, Image } from "lucide-react";
import { useAgentConfig } from "@/hooks/useAgentConfig";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

const ADMIN_EMAIL = "kokomu.matsuo@starup01.jp";

// Common emoji options for quick selection
const EMOJI_OPTIONS = [
  "🍎", "🎨", "💻", "🧘", "🚀", "💡", "🎯", "🔮",
  "🌟", "🎭", "📚", "🎵", "🏆", "💎", "🌈", "⚡",
  "🤖", "👨‍💼", "👩‍🔬", "🧙‍♂️", "🦊", "🐱", "🦁", "🐸",
];

const Settings = () => {
  const { agents, updateAgent, resetToDefaults } = useAgentConfig();
  const { user, loading } = useAuth();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showIconPicker, setShowIconPicker] = useState<string | null>(null);

  // Redirect non-admin users
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">読み込み中...</div>
      </div>
    );
  }

  if (!user || user.email !== ADMIN_EMAIL) {
    return <Navigate to="/" replace />;
  }

  const handleSave = () => {
    setEditingId(null);
    setShowIconPicker(null);
    toast.success("設定を保存しました");
  };

  const handleReset = () => {
    resetToDefaults();
    toast.success("デフォルト設定に戻しました");
  };

  const handleEmojiSelect = (agentId: string, emoji: string) => {
    updateAgent(agentId, { emoji, imageUrl: undefined });
    setShowIconPicker(null);
    toast.success("アイコンを変更しました");
  };

  const handleImageUpload = (agentId: string, file: File) => {
    if (file.size > 2 * 1024 * 1024) {
      toast.error("ファイルサイズは2MB以下にしてください");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("画像ファイルを選択してください");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      updateAgent(agentId, { imageUrl });
      setShowIconPicker(null);
      toast.success("画像をアップロードしました");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = (agentId: string) => {
    updateAgent(agentId, { imageUrl: undefined });
    toast.success("画像を削除しました");
  };

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-2xl mx-auto px-6 py-8 animate-fade-in">
        {/* Header */}
        <header className="flex items-center justify-between mb-10">
          <Link
            to="/"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">戻る</span>
          </Link>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            リセット
          </button>
        </header>

        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            エージェント設定
          </h1>
          <p className="mt-2 text-muted-foreground">
            各エージェントのAgent IDとアイコンを設定できます
          </p>
        </div>

        {/* Agent List */}
        <div className="space-y-4">
          {agents.map((agent) => {
            const isEditing = editingId === agent.id;
            const hasAgentId = agent.agentId.trim().length > 0;
            const isIconPickerOpen = showIconPicker === agent.id;
            const hasCustomImage = !!agent.imageUrl;

            return (
              <div
                key={agent.id}
                className={cn(
                  "relative overflow-hidden rounded-2xl bg-card border transition-all duration-300",
                  isEditing || isIconPickerOpen
                    ? "border-primary shadow-lg"
                    : "border-border/50 hover:border-border"
                )}
              >
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Avatar - Clickable for icon picker */}
                    <div className="relative">
                      <button
                        onClick={() => setShowIconPicker(isIconPickerOpen ? null : agent.id)}
                        className={cn(
                          "w-16 h-16 rounded-full flex items-center justify-center shadow-lg flex-shrink-0 transition-all duration-300 overflow-hidden",
                          "hover:scale-105 hover:shadow-xl active:scale-95",
                          "ring-2 ring-transparent hover:ring-primary/30",
                          !hasCustomImage && `bg-gradient-to-br ${agent.gradient}`
                        )}
                        style={{
                          boxShadow: `0 10px 30px -10px rgba(0,0,0,0.2), inset 0 -5px 15px rgba(0,0,0,0.15), inset 0 5px 15px rgba(255,255,255,0.15)`,
                        }}
                      >
                        {hasCustomImage ? (
                          <img
                            src={agent.imageUrl}
                            alt={agent.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="drop-shadow-sm text-3xl">{agent.emoji}</span>
                        )}
                      </button>
                      <span className="absolute -bottom-1 -right-1 text-xs bg-card border border-border rounded-full px-1.5 py-0.5 shadow-sm">
                        編集
                      </span>

                      {/* Icon Picker Dropdown */}
                      {isIconPickerOpen && (
                        <div 
                          className="absolute top-full left-0 mt-2 z-50 animate-fade-in"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="bg-card border border-border rounded-2xl shadow-xl p-4 w-72">
                            {/* Image Upload Section */}
                            <div className="mb-4">
                              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                                <Image className="w-3 h-3" />
                                画像をアップロード
                              </p>
                              <input
                                id={`agent-image-${agent.id}`}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    handleImageUpload(agent.id, file);
                                  }
                                }}
                              />
                              <div className="flex gap-2">
                                <label
                                  htmlFor={`agent-image-${agent.id}`}
                                  className={cn(
                                    "flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-sm rounded-xl border-2 border-dashed transition-all cursor-pointer",
                                    "border-border hover:border-primary hover:bg-primary/5 text-muted-foreground hover:text-foreground"
                                  )}
                                >
                                  <Upload className="w-4 h-4" />
                                  画像を選択
                                </label>
                                {hasCustomImage && (
                                  <button
                                    onClick={() => handleRemoveImage(agent.id)}
                                    className="px-3 py-2 text-sm rounded-xl border border-destructive/50 text-destructive hover:bg-destructive/10 transition-colors"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground/60 mt-1.5">
                                最大2MB、JPG/PNG/GIF対応
                              </p>
                            </div>

                            <div className="border-t border-border pt-4">
                              <p className="text-xs text-muted-foreground mb-2">または絵文字を選択</p>
                              <div className="grid grid-cols-8 gap-1">
                                {EMOJI_OPTIONS.map((emoji) => (
                                  <button
                                    key={emoji}
                                    onClick={() => handleEmojiSelect(agent.id, emoji)}
                                    className={cn(
                                      "w-7 h-7 rounded-lg flex items-center justify-center text-lg transition-all",
                                      "hover:bg-accent hover:scale-110",
                                      !hasCustomImage && agent.emoji === emoji && "bg-primary/20 ring-2 ring-primary"
                                    )}
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </div>
                              <div className="mt-3 pt-3 border-t border-border">
                                <label className="text-xs text-muted-foreground block mb-1.5">
                                  カスタム絵文字
                                </label>
                                <input
                                  type="text"
                                  placeholder="絵文字を入力..."
                                  maxLength={2}
                                  className="w-full px-3 py-1.5 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    if (value) {
                                      handleEmojiSelect(agent.id, value);
                                    }
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 space-y-4">
                      {/* Status badge */}
                      <div className="flex items-center gap-2">
                        {hasAgentId ? (
                          <span className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                            <Check className="w-3 h-3" />
                            設定済み
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-0.5 rounded-full">
                            <AlertCircle className="w-3 h-3" />
                            未設定
                          </span>
                        )}
                      </div>

                      {/* Name Input */}
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1.5">
                          名前
                        </label>
                        <input
                          type="text"
                          value={agent.name}
                          onChange={(e) =>
                            updateAgent(agent.id, { name: e.target.value })
                          }
                          onFocus={() => {
                            setEditingId(agent.id);
                            setShowIconPicker(null);
                          }}
                          placeholder="エージェント名"
                          className={cn(
                            "w-full px-3 py-2 text-sm font-medium rounded-xl border bg-background transition-all duration-200",
                            "placeholder:text-muted-foreground/50",
                            "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary",
                            "border-input hover:border-border"
                          )}
                        />
                      </div>

                      {/* Description Input */}
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1.5">
                          説明
                        </label>
                        <input
                          type="text"
                          value={agent.description}
                          onChange={(e) =>
                            updateAgent(agent.id, { description: e.target.value })
                          }
                          onFocus={() => {
                            setEditingId(agent.id);
                            setShowIconPicker(null);
                          }}
                          placeholder="エージェントの説明"
                          className={cn(
                            "w-full px-3 py-2 text-sm rounded-xl border bg-background transition-all duration-200",
                            "placeholder:text-muted-foreground/50",
                            "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary",
                            "border-input hover:border-border"
                          )}
                        />
                      </div>

                      {/* Agent ID Input */}
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1.5">
                          ElevenLabs Agent ID
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={agent.agentId}
                            onChange={(e) =>
                              updateAgent(agent.id, { agentId: e.target.value })
                            }
                            onFocus={() => {
                              setEditingId(agent.id);
                              setShowIconPicker(null);
                            }}
                            placeholder="agent_xxxxxxxxxxxxxx"
                            className={cn(
                              "flex-1 px-3 py-2 text-sm rounded-xl border bg-background transition-all duration-200",
                              "placeholder:text-muted-foreground/50",
                              "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary",
                              isEditing
                                ? "border-primary"
                                : "border-input hover:border-border"
                            )}
                          />
                          {isEditing && (
                            <button
                              onClick={handleSave}
                              className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-xl hover:bg-primary/90 transition-colors"
                            >
                              保存
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom gradient accent */}
                <div
                  className={cn(
                    "absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r opacity-50",
                    agent.gradient
                  )}
                />
              </div>
            );
          })}
        </div>

        {/* Help text */}
        <div className="mt-8 p-4 rounded-xl bg-muted/50 border border-border/50">
          <h4 className="text-sm font-medium text-foreground mb-2">
            Agent IDの取得方法
          </h4>
          <ol className="text-sm text-muted-foreground space-y-1.5 list-decimal list-inside">
            <li>ElevenLabsにログインしてAgentを作成</li>
            <li>作成したAgentの詳細画面を開く</li>
            <li>Agent IDをコピーして上記フィールドに貼り付け</li>
          </ol>
        </div>
      </div>

      {/* アイコンピッカーはクリックで開閉する方式にしているため、
          画面全体のオーバーレイは使用しません */}
    </div>
  );
};

export default Settings;
