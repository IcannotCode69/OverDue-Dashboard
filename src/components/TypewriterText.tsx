import React, { useState, useEffect } from "react";

export interface TypewriterTextProps {
  text: string;
  className?: string;
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
  loop?: boolean;
}

const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  className = "",
  typingSpeed = 150,
  deletingSpeed = 100,
  pauseDuration = 2000,
  loop = true,
}) => {
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    if (isPaused) {
      timeout = setTimeout(() => {
        setIsPaused(false);
        if (loop) {
          setIsDeleting(true);
        }
      }, pauseDuration);
      return () => clearTimeout(timeout);
    }

    if (isDeleting) {
      if (displayText === "") {
        setIsDeleting(false);
        return;
      }
      timeout = setTimeout(() => {
        setDisplayText(displayText.slice(0, -1));
      }, deletingSpeed);
    } else {
      if (displayText === text) {
        setIsPaused(true);
        return;
      }
      timeout = setTimeout(() => {
        setDisplayText(text.slice(0, displayText.length + 1));
      }, typingSpeed);
    }

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, isPaused, text, typingSpeed, deletingSpeed, pauseDuration, loop]);

  return (
    <span className={className}>
      {displayText}
      <span className="landing-typewriter-cursor" />
    </span>
  );
};

export default TypewriterText;
