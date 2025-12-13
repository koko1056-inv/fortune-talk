import VoiceChat from "@/components/VoiceChat";

const Index = () => {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background overflow-hidden">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
      </div>
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-2xl px-6 py-12 animate-fade-in">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
            <span className="text-gradient">Voice AI</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground font-light tracking-wide">
            シンプルに、話しかけるだけ。
          </p>
        </header>

        {/* Voice Chat Interface */}
        <main className="w-full">
          <VoiceChat />
        </main>

        {/* Footer */}
        <footer className="mt-16 text-center">
          <p className="text-sm text-muted-foreground/60 leading-relaxed">
            ボタンをタップしてマイクを有効にし、
            <br />
            自然に話しかけてください。
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
