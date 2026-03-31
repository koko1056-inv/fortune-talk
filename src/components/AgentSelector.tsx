import { cn } from "@/lib/utils";
import { AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { AgentConfig } from "@/hooks/useAgentConfig";
import { useMemo, useRef, useCallback } from "react";

export type Agent = AgentConfig;
interface AgentSelectorProps {
  agents: Agent[];
  selectedAgent: Agent;
  onSelect: (agent: Agent) => void;
  disabled?: boolean;
}

const AgentSelector = ({
  agents,
  selectedAgent,
  onSelect,
  disabled
}: AgentSelectorProps) => {
  const selectedIndex = useMemo(
    () => agents.findIndex(a => a.id === selectedAgent.id),
    [agents, selectedAgent.id]
  );

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const findNextAvailableAgent = useCallback((direction: 'prev' | 'next'): number => {
    const step = direction === 'prev' ? -1 : 1;
    let newIndex = selectedIndex;
    for (let i = 0; i < agents.length; i++) {
      newIndex = (newIndex + step + agents.length) % agents.length;
      if (agents[newIndex].agentId.trim().length > 0) {
        return newIndex;
      }
    }
    return selectedIndex;
  }, [agents, selectedIndex]);

  const navigateTo = useCallback((direction: 'prev' | 'next') => {
    if (disabled) return;
    const newIndex = findNextAvailableAgent(direction);
    if (newIndex !== selectedIndex) {
      onSelect(agents[newIndex]);
    }
  }, [findNextAvailableAgent, agents, selectedIndex, onSelect, disabled]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const diffX = touchStartX.current - touchEndX;
    const diffY = touchStartY.current - touchEndY;
    const minSwipeDistance = 50;

    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > minSwipeDistance) {
      if (diffX > 0) navigateTo('next');
      else navigateTo('prev');
    }
    touchStartX.current = null;
    touchStartY.current = null;
  }, [navigateTo]);

  const getCircularOffset = (index: number) => {
    let offset = index - selectedIndex;
    const half = agents.length / 2;
    if (offset > half) offset -= agents.length;
    if (offset < -half) offset += agents.length;
    return offset;
  };

  const displayAgents = agents.map((agent, index) => ({
    agent,
    offset: getCircularOffset(index)
  }));

  return (
    <div className="w-full flex flex-col items-center">
      {/* Carousel with swipe support */}
      <div
        ref={containerRef}
        className="relative w-full h-52 md:h-72 flex items-center justify-center touch-pan-y select-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Navigation arrows — meets 44px touch target */}
        <button
          onClick={() => navigateTo('prev')}
          disabled={disabled}
          className="absolute left-1 md:left-4 z-20 touch-target rounded-full glass-surface text-muted-foreground hover:text-foreground transition-all disabled:opacity-30"
          aria-label="前の占い師"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={() => navigateTo('next')}
          disabled={disabled}
          className="absolute right-1 md:right-4 z-20 touch-target rounded-full glass-surface text-muted-foreground hover:text-foreground transition-all disabled:opacity-30"
          aria-label="次の占い師"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Spheres container */}
        <div className="relative w-full h-full flex items-center justify-center">
          {displayAgents.map(({ agent, offset }) => {
            const isSelected = offset === 0;
            const hasAgentId = agent.agentId.trim().length > 0;
            const absOffset = Math.abs(offset);
            const scale = isSelected ? 1 : Math.max(0.45, 0.7 - absOffset * 0.12);
            const translateX = offset * 90;
            const translateZ = isSelected ? 0 : -80 - absOffset * 40;
            const opacity = isSelected ? 1 : Math.max(0.25, 0.6 - absOffset * 0.2);
            const zIndex = 10 - absOffset;

            return (
              <button
                key={agent.id}
                onClick={() => hasAgentId && onSelect(agent)}
                disabled={disabled || !hasAgentId}
                className={cn(
                  "absolute flex flex-col items-center transition-all duration-500 ease-out",
                  "disabled:cursor-not-allowed",
                  !isSelected && hasAgentId && "hover:opacity-90 cursor-pointer"
                )}
                style={{
                  transform: `translateX(${translateX}px) translateZ(${translateZ}px) scale(${scale})`,
                  opacity,
                  zIndex
                }}
              >
                {/* Sphere */}
                <div
                  className={cn(
                    "relative rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 overflow-hidden",
                    !agent.imageUrl && "bg-gradient-to-br",
                    !agent.imageUrl && agent.gradient,
                    isSelected
                      ? "w-36 h-36 md:w-44 md:h-44"
                      : "w-16 h-16 md:w-20 md:h-20"
                  )}
                  style={{
                    boxShadow: isSelected
                      ? '0 20px 60px -15px rgba(0,0,0,0.4), inset 0 -10px 30px rgba(0,0,0,0.2), inset 0 10px 30px rgba(255,255,255,0.15)'
                      : '0 10px 30px -10px rgba(0,0,0,0.3), inset 0 -5px 15px rgba(0,0,0,0.15), inset 0 5px 15px rgba(255,255,255,0.1)'
                  }}
                >
                  {agent.imageUrl ? (
                    <img src={agent.imageUrl} alt={agent.name} className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <div className={cn(
                        "absolute top-2 left-1/4 rounded-full bg-white/25 blur-sm",
                        isSelected ? "w-6 h-6" : "w-3 h-3"
                      )} />
                      <span className={cn(
                        "drop-shadow-lg transition-all duration-500",
                        isSelected ? "text-4xl md:text-5xl" : "text-xl md:text-2xl"
                      )}>
                        {agent.emoji}
                      </span>
                    </>
                  )}

                  {!hasAgentId && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center shadow-lg">
                      <AlertCircle className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>

                {/* Agent info — only for selected */}
                {isSelected && (
                  <div className="mt-4 md:mt-5 text-center animate-fade-in">
                    <h3 className="text-base md:text-lg font-bold text-foreground tracking-wide">
                      {agent.name}
                    </h3>
                    <p className="text-xs md:text-sm text-muted-foreground mt-1 max-w-[220px] leading-relaxed">
                      {agent.description}
                    </p>
                    {!hasAgentId && (
                      <p className="text-xs text-amber-500 mt-2 flex items-center justify-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Agent ID未設定
                      </p>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dots indicator — proper touch targets */}
      <div className="flex items-center gap-2 mt-3">
        {agents.map((agent, index) => (
          <button
            key={agent.id}
            onClick={() => agent.agentId.trim().length > 0 && onSelect(agent)}
            disabled={disabled || agent.agentId.trim().length === 0}
            className={cn(
              "rounded-full transition-all duration-300",
              index === selectedIndex
                ? "w-5 h-2 bg-primary"
                : agent.agentId.trim().length > 0
                  ? "w-2 h-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  : "w-2 h-2 bg-muted-foreground/15"
            )}
            style={{ minHeight: '8px' }}
            aria-label={agent.name}
          />
        ))}
      </div>

      {/* Swipe hint */}
      <p className="text-[10px] text-muted-foreground/40 mt-3 tracking-widest md:hidden">
        左右にスワイプして選択
      </p>
    </div>
  );
};
export default AgentSelector;
