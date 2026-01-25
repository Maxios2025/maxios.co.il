
"use client";

import React, { useRef, useEffect, useState, createElement, useMemo, useCallback, memo } from "react";

export enum Tag {
  H1 = "h1",
  H2 = "h2",
  H3 = "h3",
  P = "p",
}

type VaporizeTextCycleProps = {
  texts: string[];
  font?: {
    fontFamily?: string;
    fontSize?: string;
    fontWeight?: number;
    fontStyle?: string;
  };
  color?: string;
  spread?: number;
  density?: number;
  animation?: {
    vaporizeDuration?: number;
    fadeInDuration?: number;
    waitDuration?: number;
  };
  direction?: "left-to-right" | "right-to-left";
  alignment?: "left" | "center" | "right";
  tag?: Tag;
  onVaporized?: () => void;
};

type Particle = {
  x: number;
  y: number;
  originalX: number;
  originalY: number;
  color: string;
  opacity: number;
  originalAlpha: number;
  velocityX: number;
  velocityY: number;
  angle: number;
  speed: number;
  shouldFadeQuickly?: boolean;
};

export default function VaporizeTextCycle({
  texts = ["MAXIOS"],
  font = {
    fontFamily: "sans-serif",
    fontSize: "50px",
    fontWeight: 400,
    fontStyle: "normal",
  },
  color = "rgb(255, 255, 255)",
  spread = 5,
  density = 5,
  animation = {
    vaporizeDuration: 2,
    fadeInDuration: 1,
    waitDuration: 0.5,
  },
  direction = "left-to-right",
  alignment = "center",
  tag = Tag.P,
  onVaporized,
}: VaporizeTextCycleProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [isInView, setIsInView] = useState(false);
  const particlesRef = useRef<Particle[]>([]);
  const [animationState, setAnimationState] = useState<"static" | "vaporizing" | "fadingIn" | "waiting">("static");
  const vaporizeProgressRef = useRef(0);
  const [wrapperSize, setWrapperSize] = useState({ width: 0, height: 0 });

  const globalDpr = useMemo(() => (typeof window !== "undefined" ? window.devicePixelRatio * 1.5 : 1), []);

  const animationDurations = useMemo(() => ({
    VAPORIZE_DURATION: (animation.vaporizeDuration ?? 2) * 1000,
    WAIT_DURATION: (animation.waitDuration ?? 0.5) * 1000,
  }), [animation.vaporizeDuration, animation.waitDuration]);

  useEffect(() => {
    if (wrapperRef.current) {
      const observer = new IntersectionObserver(([entry]) => setIsInView(entry.isIntersecting));
      observer.observe(wrapperRef.current);
      return () => observer.disconnect();
    }
  }, []);

  useEffect(() => {
    if (isInView) {
      setAnimationState("waiting");
      const timer = setTimeout(() => setAnimationState("vaporizing"), animationDurations.WAIT_DURATION);
      return () => clearTimeout(timer);
    }
  }, [isInView, animationDurations.WAIT_DURATION]);

  useEffect(() => {
    if (!isInView) return;
    let lastTime = performance.now();
    let frameId: number;

    const animate = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx || !particlesRef.current.length) { frameId = requestAnimationFrame(animate); return; }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (animationState === "vaporizing") {
        vaporizeProgressRef.current += deltaTime * 100 / (animationDurations.VAPORIZE_DURATION / 1000);
        const metrics = (canvas as any).textBoundaries;
        const progress = Math.min(100, vaporizeProgressRef.current);
        const vaporizeX = direction === "left-to-right" ? metrics.left + metrics.width * progress / 100 : metrics.right - metrics.width * progress / 100;
        
        let allDone = true;
        particlesRef.current.forEach(p => {
          if ((direction === "left-to-right" ? p.originalX <= vaporizeX : p.originalX >= vaporizeX)) {
            if (p.speed === 0) {
              p.angle = Math.random() * Math.PI * 2;
              p.speed = (Math.random() * 2 + 1) * spread;
              p.velocityX = Math.cos(p.angle) * p.speed;
              p.velocityY = Math.sin(p.angle) * p.speed;
            }
            p.x += p.velocityX * deltaTime * 50;
            p.y += p.velocityY * deltaTime * 50;
            p.opacity = Math.max(0, p.opacity - deltaTime * 0.8);
          }
          if (p.opacity > 0.01) allDone = false;
        });

        if (vaporizeProgressRef.current >= 100 && allDone && onVaporized) {
          onVaporized();
          return;
        }
      }

      ctx.save();
      ctx.scale(globalDpr, globalDpr);
      particlesRef.current.forEach(p => {
        if (p.opacity > 0) {
          ctx.fillStyle = p.color.replace(/[\d.]+\)$/, `${p.opacity})`);
          ctx.fillRect(p.x / globalDpr, p.y / globalDpr, 1.2, 1.2);
        }
      });
      ctx.restore();
      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [animationState, isInView, animationDurations.VAPORIZE_DURATION, onVaporized, direction, spread, globalDpr]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || wrapperSize.width === 0) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = wrapperSize.width * globalDpr;
    canvas.height = wrapperSize.height * globalDpr;
    canvas.style.width = `${wrapperSize.width}px`;
    canvas.style.height = `${wrapperSize.height}px`;

    const fSize = parseInt(font.fontSize || "50") * globalDpr;
    ctx.font = `${font.fontWeight || 400} ${fSize}px ${font.fontFamily}`;
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const text = texts[0];
    const x = canvas.width / 2;
    const y = canvas.height / 2;
    ctx.fillText(text, x, y);

    const metrics = ctx.measureText(text);
    (canvas as any).textBoundaries = { left: x - metrics.width / 2, right: x + metrics.width / 2, width: metrics.width };

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const newParticles: Particle[] = [];
    const step = Math.max(1, Math.round(globalDpr));
    for (let py = 0; py < canvas.height; py += step) {
      for (let px = 0; px < canvas.width; px += step) {
        const i = (py * canvas.width + px) * 4;
        if (imgData[i+3] > 128) {
          newParticles.push({
            x: px, y: py, originalX: px, originalY: py,
            color: `rgba(${imgData[i]},${imgData[i+1]},${imgData[i+2]},1)`,
            opacity: 1, originalAlpha: 1, velocityX: 0, velocityY: 0, angle: 0, speed: 0
          });
        }
      }
    }
    particlesRef.current = newParticles;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, [wrapperSize, texts, font, color, globalDpr]);

  useEffect(() => {
    if (wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      setWrapperSize({ width: rect.width, height: rect.height });
    }
  }, []);

  return (
    <div ref={wrapperRef} className="w-full h-full flex items-center justify-center">
      <canvas ref={canvasRef} />
    </div>
  );
}
