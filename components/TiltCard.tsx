"use client";
import { useRef, type ReactNode, type CSSProperties } from "react";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export default function TiltCard({ children, className = "", style }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const { left, top, width, height } = el.getBoundingClientRect();
    const dx = (e.clientX - left) / width - 0.5;
    const dy = (e.clientY - top) / height - 0.5;
    el.style.transform = `perspective(900px) rotateY(${dx * 6}deg) rotateX(${-dy * 6}deg)`;
  };

  const handleMouseLeave = () => {
    if (ref.current) ref.current.style.transform = "";
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
      style={{ transition: "transform 0.15s ease", ...style }}
    >
      {children}
    </div>
  );
}
