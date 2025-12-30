import { useState, useRef, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";

const MUSIC_URL = "https://cdn.pixabay.com/audio/2022/10/25/audio_946bd498eb.mp3"; // Mystical ambient

export const BackgroundMusic = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    const savedPreference = localStorage.getItem("bgm-enabled");
    if (savedPreference === "true") {
      setHasInteracted(true);
    }
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.3;
      audioRef.current.loop = true;
    }
  }, []);

  const toggleMusic = async () => {
    if (!audioRef.current) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
        localStorage.setItem("bgm-enabled", "false");
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
        setHasInteracted(true);
        localStorage.setItem("bgm-enabled", "true");
      }
    } catch (error) {
      console.error("Audio playback failed:", error);
    }
  };

  return (
    <>
      <audio ref={audioRef} src={MUSIC_URL} preload="auto" />
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleMusic}
        className="fixed bottom-4 right-4 z-50 glass-surface hover-scale rounded-full w-12 h-12"
        title={isPlaying ? "音楽を停止" : "音楽を再生"}
      >
        {isPlaying ? (
          <Volume2 className="h-5 w-5 text-primary animate-pulse" />
        ) : (
          <VolumeX className="h-5 w-5 text-muted-foreground" />
        )}
      </Button>
    </>
  );
};
