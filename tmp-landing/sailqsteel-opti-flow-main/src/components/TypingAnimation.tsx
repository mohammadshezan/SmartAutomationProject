import { useState, useEffect } from "react";

const lines = [
  "Powering India's Steel Revolution",
  "Harnessing AI and Machine Learning for Smarter Logistics",
  "Optimizing Rake Formation from Bokaro to CMO",
  "Reducing Costs, Maximizing Utilization, and Ensuring On-Time Delivery",
  "Driving the Future of Intelligent Steel Logistics",
];

const TypingAnimation = () => {
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    // Cursor blink effect
    const cursorInterval = setInterval(() => {
      if (currentLineIndex < lines.length - 1 || displayedText !== lines[currentLineIndex]) {
        setShowCursor((prev) => !prev);
      } else {
        setShowCursor(true); // Keep cursor visible on final line
      }
    }, 530);

    return () => clearInterval(cursorInterval);
  }, [currentLineIndex, displayedText]);

  useEffect(() => {
    const currentLine = lines[currentLineIndex];
    
    // If we're on the last line and it's fully typed, stop
    if (currentLineIndex === lines.length - 1 && displayedText === currentLine && !isDeleting) {
      setIsPaused(true);
      return;
    }

    if (isPaused) {
      const pauseTimeout = setTimeout(() => {
        setIsPaused(false);
        setIsDeleting(true);
      }, 1500);
      return () => clearTimeout(pauseTimeout);
    }

    if (isDeleting) {
      if (displayedText === "") {
        setIsDeleting(false);
        setCurrentLineIndex((prev) => (prev + 1) % lines.length);
      } else {
        const deleteTimeout = setTimeout(() => {
          setDisplayedText((prev) => prev.slice(0, -1));
        }, 30);
        return () => clearTimeout(deleteTimeout);
      }
    } else {
      if (displayedText === currentLine) {
        if (currentLineIndex < lines.length - 1) {
          const pauseTimeout = setTimeout(() => {
            setIsPaused(true);
          }, 1500);
          return () => clearTimeout(pauseTimeout);
        }
      } else {
        const typingSpeed = currentLineIndex === 3 ? 85 : 70; // Slower for impact line
        const typeTimeout = setTimeout(() => {
          setDisplayedText((prev) => currentLine.slice(0, prev.length + 1));
        }, typingSpeed);
        return () => clearTimeout(typeTimeout);
      }
    }
  }, [displayedText, isDeleting, currentLineIndex, isPaused]);

  return (
    <div className="min-h-[120px] flex items-center justify-center">
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight text-center">
        {displayedText}
        <span 
          className={`inline-block w-1 h-12 md:h-14 lg:h-16 ml-1 bg-primary-foreground align-middle ${
            showCursor ? "opacity-100" : "opacity-0"
          } transition-opacity duration-100`}
        />
      </h1>
    </div>
  );
};

export default TypingAnimation;
