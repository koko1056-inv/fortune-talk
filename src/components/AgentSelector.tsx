import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { Settings, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { AgentConfig } from "@/hooks/useAgentConfig";
import { useMemo, useRef, useCallback } from "react";
import { useIsAdmin } from "@/hooks/useIsAdmin";

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
  const { isAdmin } = useIsAdmin();
  const selectedIndex = useMemo(() => agents.findIndex(a => a.id === selectedAgent.id), [agents, selectedAgent.id]);

  // Swipe handling
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Find next available agent in given direction (循環型)
  const findNextAvailableAgent = useCallback((direction: 'prev' | 'next'): number => {
    const step = direction === 'prev' ? -1 : 1;
    let newIndex = selectedIndex;

    // Loop through all agents to find next available one
    for (let i = 0; i < agents.length; i++) {
      newIndex = (newIndex + step + agents.length) % agents.length;
      if (agents[newIndex].agentId.trim().length > 0) {
        return newIndex;
      }
    }
    return selectedIndex; // No available agent found
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

    // Minimum swipe distance threshold
    const minSwipeDistance = 50;

    // Only trigger if horizontal swipe is dominant
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > minSwipeDistance) {
      if (diffX > 0) {
        navigateTo('next');
      } else {
        navigateTo('prev');
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  }, [navigateTo]);

  // 循環型表示: 選択中を中心に配置
  const getCircularOffset = (index: number) => {
    let offset = index - selectedIndex;
    const half = agents.length / 2;

    // Wrap around for circular effect
    if (offset > half) offset -= agents.length;
    if (offset < -half) offset += agents.length;
    return offset;
  };
  const displayAgents = agents.map((agent, index) => ({
    agent,
    offset: getCircularOffset(index)
  }));
  return <div className="w-full flex flex-col items-center">
      {/* Header */}
      <div className="flex items-center justify-between w-full max-w-sm px-4 mb-4 md:mb-8">
        
        {isAdmin && (
          <Link to="/settings" className="flex items-center gap-1 md:gap-1.5 text-xs text-muted-foreground hover:text-accent transition-colors ml-auto">
            <Settings className="w-3 h-3 md:w-3.5 md:h-3.5" />
            <span className="hidden sm:inline">設定</span>
          </Link>
        )}
      </div>

      {/* Carousel with swipe support */}
      <div ref={containerRef} className="relative w-full h-48 md:h-64 flex items-center justify-center touch-pan-y select-none" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        {/* Navigation arrows */}
        <button onClick={() => navigateTo('prev')} disabled={disabled} className="absolute left-2 md:left-4 z-20 p-1.5 md:p-2 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 text-muted-foreground hover:text-foreground hover:bg-card transition-all shadow-sm disabled:opacity-50">
          <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
        </button>

        <button onClick={() => navigateTo('next')} disabled={disabled} className="absolute right-2 md:right-4 z-20 p-1.5 md:p-2 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 text-muted-foreground hover:text-foreground hover:bg-card transition-all shadow-sm disabled:opacity-50">
          <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
        </button>

        {/* Spheres container */}
        <div className="relative w-full h-full flex items-center justify-center">
          {displayAgents.map(({
          agent,
          offset
        }) => {
          const isSelected = offset === 0;
          const hasAgentId = agent.agentId.trim().length > 0;

          // Calculate position and scale based on offset
          const absOffset = Math.abs(offset);
          const scale = isSelected ? 1 : Math.max(0.4, 0.7 - absOffset * 0.15);
          const translateX = offset * 80; // Reduced for mobile
          const translateZ = isSelected ? 0 : -100 - absOffset * 50;
          const opacity = isSelected ? 1 : Math.max(0.3, 0.7 - absOffset * 0.2);
          const zIndex = 10 - absOffset;
          return <button key={agent.id} onClick={() => hasAgentId && onSelect(agent)} disabled={disabled || !hasAgentId} className={cn("absolute flex flex-col items-center transition-all duration-500 ease-out", "disabled:cursor-not-allowed", !isSelected && hasAgentId && "hover:opacity-100 cursor-pointer")} style={{
            transform: `translateX(${translateX}px) translateZ(${translateZ}px) scale(${scale})`,
            opacity,
            zIndex
          }}>
                {/* Sphere */}
                <div className={cn("relative rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 overflow-hidden", !agent.imageUrl && "bg-gradient-to-br", !agent.imageUrl && agent.gradient, isSelected ? "w-24 h-24 md:w-32 lg:w-40 md:h-32 lg:h-40" : "w-14 h-14 md:w-20 md:h-20")} style={{
              boxShadow: isSelected ? `0 20px 60px -15px rgba(0,0,0,0.3), inset 0 -10px 30px rgba(0,0,0,0.2), inset 0 10px 30px rgba(255,255,255,0.2)` : `0 10px 30px -10px rgba(0,0,0,0.2), inset 0 -5px 15px rgba(0,0,0,0.15), inset 0 5px 15px rgba(255,255,255,0.15)`
            }}>
                  {agent.imageUrl ? <img src={agent.imageUrl} alt={agent.name} className="w-full h-full object-cover" /> : <>
                      {/* Shine effect */}
                      <div className={cn("absolute top-2 left-1/4 rounded-full bg-white/30 blur-sm", isSelected ? "w-6 h-6 md:w-8 md:h-8" : "w-3 h-3 md:w-4 md:h-4")} />
                      
                      {/* Emoji */}
                      <span className={cn("drop-shadow-lg transition-all duration-500", isSelected ? "text-4xl md:text-5xl lg:text-6xl" : "text-xl md:text-2xl lg:text-3xl")}>
                        {agent.emoji}
                      </span>
                    </>}

                  {/* Not configured badge */}
                  {!hasAgentId && <div className="absolute -top-1 -right-1 w-5 h-5 md:w-6 md:h-6 rounded-full bg-amber-500 flex items-center justify-center shadow-lg">
                      <AlertCircle className="w-3 h-3 md:w-4 md:h-4 text-white" />
                    </div>}
                </div>

                {/* Agent info - only show for selected */}
                {isSelected && <div className="mt-3 md:mt-6 text-center animate-fade-in">
                    <h3 className="text-base md:text-xl font-bold text-foreground">
                      {agent.name}
                    </h3>
                    <p className="text-xs md:text-sm text-muted-foreground mt-0.5 md:mt-1 max-w-[200px] md:max-w-none">
                      {agent.description}
                    </p>
                    {!hasAgentId && <p className="text-xs text-amber-500 mt-1 md:mt-2 flex items-center justify-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Agent ID未設定
                      </p>}
                  </div>}
              </button>;
        })}
        </div>
      </div>

      {/* Dots indicator */}
      <div className="flex items-center gap-1.5 md:gap-2 mt-2 md:mt-4">
        {agents.map((agent, index) => <button key={agent.id} onClick={() => agent.agentId.trim().length > 0 && onSelect(agent)} disabled={disabled || agent.agentId.trim().length === 0} className={cn("w-1.5 h-1.5 md:w-2 md:h-2 rounded-full transition-all duration-300", index === selectedIndex ? "w-4 md:w-6 bg-primary" : agent.agentId.trim().length > 0 ? "bg-muted-foreground/30 hover:bg-muted-foreground/50" : "bg-muted-foreground/20")} />)}
      </div>

      {/* Swipe hint - hide on desktop */}
      <p className="text-[10px] md:text-xs text-accent/40 mt-2 md:mt-4 tracking-wider md:hidden">
        ✧ 左右にスワイプして選択 ✧
      </p>
    </div>;
};
export default AgentSelector;