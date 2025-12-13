import { useMemo } from "react";

interface Star {
  id: number;
  x: number;
  y: number;
  size: "small" | "medium" | "large";
  delay: number;
  duration: number;
}

const StarField = () => {
  const stars = useMemo<Star[]>(() => {
    return Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() > 0.85 ? "large" : Math.random() > 0.5 ? "medium" : "small",
      delay: Math.random() * 5,
      duration: 2 + Math.random() * 3,
    }));
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Deep space gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background" />
      
      {/* Nebula effects */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] animate-float-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px] animate-float-slow" style={{ animationDelay: '3s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/3 rounded-full blur-[150px]" />
      
      {/* Stars */}
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size === "large" ? "4px" : star.size === "medium" ? "2px" : "1px",
            height: star.size === "large" ? "4px" : star.size === "medium" ? "2px" : "1px",
            background: star.size === "large" 
              ? "hsl(45 90% 90%)" 
              : star.size === "medium"
                ? "hsl(45 70% 80%)"
                : "hsl(260 30% 70%)",
            boxShadow: star.size === "large" 
              ? "0 0 8px hsl(45 80% 70%), 0 0 15px hsl(45 80% 60%)" 
              : star.size === "medium"
                ? "0 0 4px hsl(45 60% 60%)"
                : "none",
            animation: `twinkle ${star.duration}s ease-in-out infinite`,
            animationDelay: `${star.delay}s`,
          }}
        />
      ))}
      
      {/* Constellation lines - subtle */}
      <svg className="absolute inset-0 w-full h-full opacity-10">
        <line x1="20%" y1="15%" x2="25%" y2="25%" stroke="hsl(45 50% 50%)" strokeWidth="0.5" />
        <line x1="25%" y1="25%" x2="30%" y2="20%" stroke="hsl(45 50% 50%)" strokeWidth="0.5" />
        <line x1="75%" y1="60%" x2="80%" y2="70%" stroke="hsl(45 50% 50%)" strokeWidth="0.5" />
        <line x1="80%" y1="70%" x2="85%" y2="65%" stroke="hsl(45 50% 50%)" strokeWidth="0.5" />
      </svg>
    </div>
  );
};

export default StarField;