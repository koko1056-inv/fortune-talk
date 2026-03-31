import { useNavigate } from "react-router-dom";
import { useAgentConfig } from "@/hooks/useAgentConfig";
import { useAuth } from "@/hooks/useAuth";
import { AlertCircle, Sparkles, Mic, MessageSquare, Loader2 } from "lucide-react";
import StarField from "@/components/StarField";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const Agents = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { agents, loading: agentsLoading } = useAgentConfig();

  if (authLoading || agentsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden flex flex-col items-center justify-center gap-6 p-8">
        <StarField />
        <div className="relative z-10 text-center">
          <div className="text-6xl mb-4">🔮</div>
          <h1 className="text-2xl font-display font-bold text-foreground mb-2">
            占い師一覧
          </h1>
          <p className="text-muted-foreground text-sm mb-6">
            ログインして占い師に相談しましょう
          </p>
          <Button onClick={() => navigate("/auth")} className="bg-accent hover:bg-accent/80 text-accent-foreground">
            ログイン
          </Button>
        </div>
      </div>
    );
  }

  const availableAgents = agents.filter(a => a.agentId.trim().length > 0);
  const comingSoonAgents = agents.filter(a => a.agentId.trim().length === 0);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <StarField />

      <div className="relative z-10 w-full max-w-lg mx-auto px-5 pt-6 pb-28">
        {/* Header */}
        <div className="mb-6">
          <p className="text-[10px] text-accent/50 tracking-[0.3em] uppercase font-display mb-1">
            Fortune Tellers
          </p>
          <h1 className="text-2xl font-display font-bold text-foreground">
            占い師
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            あなたの運命を紐解く{agents.length}人の占い師
          </p>
        </div>

        {/* Available Agents */}
        <div className="space-y-4">
          {availableAgents.map((agent) => (
            <button
              key={agent.id}
              onClick={() => navigate("/")}
              className="w-full text-left glass-surface rounded-2xl p-5 hover:border-accent/30 transition-all duration-300 active:scale-[0.98] group"
            >
              <div className="flex items-start gap-4">
                {/* Agent avatar */}
                <div
                  className={cn(
                    "w-16 h-16 rounded-full flex items-center justify-center shrink-0 overflow-hidden",
                    "bg-gradient-to-br shadow-lg",
                    agent.gradient
                  )}
                  style={{
                    boxShadow: `0 8px 24px -4px hsl(${agent.accentColor} / 0.3)`,
                  }}
                >
                  {agent.imageUrl ? (
                    <img src={agent.imageUrl} alt={agent.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl">{agent.emoji}</span>
                  )}
                </div>

                {/* Agent info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-foreground group-hover:text-accent transition-colors">
                    {agent.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    {agent.description}
                  </p>

                  {/* Capabilities */}
                  <div className="flex items-center gap-3 mt-3">
                    <span className="inline-flex items-center gap-1 text-[10px] text-accent/70 px-2.5 py-1 rounded-full bg-accent/10">
                      <Mic className="w-3 h-3" />
                      音声対応
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] text-primary/70 px-2.5 py-1 rounded-full bg-primary/10">
                      <MessageSquare className="w-3 h-3" />
                      テキスト対応
                    </span>
                  </div>
                </div>
              </div>

              {/* CTA hint */}
              <div className="mt-4 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-medium text-primary">
                  この占い師に相談する
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Coming Soon Agents */}
        {comingSoonAgents.length > 0 && (
          <>
            <div className="flex items-center gap-3 mt-8 mb-4">
              <div className="h-px flex-1 bg-border/30" />
              <span className="text-[10px] text-muted-foreground/50 tracking-widest uppercase">
                Coming Soon
              </span>
              <div className="h-px flex-1 bg-border/30" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {comingSoonAgents.map((agent) => (
                <div
                  key={agent.id}
                  className="glass-surface rounded-xl p-4 text-center opacity-60"
                >
                  <div
                    className={cn(
                      "w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 overflow-hidden",
                      "bg-gradient-to-br",
                      agent.gradient
                    )}
                  >
                    {agent.imageUrl ? (
                      <img src={agent.imageUrl} alt={agent.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl">{agent.emoji}</span>
                    )}
                  </div>
                  <h3 className="text-sm font-medium text-foreground">{agent.name}</h3>
                  <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed line-clamp-2">
                    {agent.description}
                  </p>
                  <div className="flex items-center justify-center gap-1 mt-2 text-[10px] text-amber-500/70">
                    <AlertCircle className="w-3 h-3" />
                    準備中
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Agents;
