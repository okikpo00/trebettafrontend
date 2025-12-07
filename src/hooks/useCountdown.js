// src/hooks/useCountdown.js
import { useEffect, useState } from "react";

export default function useCountdown(initialSeconds) {
  const [secondsLeft, setSecondsLeft] = useState(
    typeof initialSeconds === "number" ? initialSeconds : 0
  );

  useEffect(() => {
    setSecondsLeft(typeof initialSeconds === "number" ? initialSeconds : 0);
  }, [initialSeconds]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [secondsLeft]);

  return secondsLeft;
}
