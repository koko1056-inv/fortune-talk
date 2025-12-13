import VoiceChat from "@/components/VoiceChat";
import StarField from "@/components/StarField";

const Index = () => {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
      {/* Animated star field background */}
      <StarField />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-2xl px-6 py-12 animate-fade-in">
        {/* Header */}
        <header className="text-center mb-12">
          <p className="text-sm text-accent/80 tracking-[0.3em] uppercase mb-3 font-display">
            Mystical Fortune
          </p>
          <h1 className="text-4xl font-display font-bold tracking-wide text-foreground md:text-5xl lg:text-6xl">
            <span className="text-gradient">神秘の占い</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground font-light tracking-wide">
            水晶に触れ、運命の扉を開く
          </p>
        </header>

        {/* Voice Chat Interface */}
        <main className="w-full">
          <VoiceChat />
        </main>

        {/* Footer */}
        <footer className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 text-accent/60 text-sm">
            <span className="w-8 h-px bg-gradient-to-r from-transparent to-accent/30" />
            <span>✧</span>
            <span className="w-8 h-px bg-gradient-to-l from-transparent to-accent/30" />
          </div>
          <p className="mt-3 text-sm text-muted-foreground/60 leading-relaxed">
            水晶玉に触れて占い師と繋がり、
            <br />
            あなたの運命を紐解いていきましょう。
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;