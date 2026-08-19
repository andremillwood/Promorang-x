import React, { useRef, useState, type MouseEvent, type ReactNode } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface TiltCard3DProps {
  children: ReactNode;
  className?: string;
  maxTilt?: number;
  perspective?: number;
  scaleOnHover?: number;
  glareEffect?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onFocusCapture?: (e: React.FocusEvent<HTMLDivElement>) => void;
  onBlurCapture?: (e: React.FocusEvent<HTMLDivElement>) => void;
}

export function TiltCard3D({
  children,
  className = "",
  maxTilt = 12,
  perspective = 1000,
  scaleOnHover = 1.02,
  glareEffect = true,
  onMouseEnter,
  onMouseLeave,
  onFocusCapture,
  onBlurCapture,
}: TiltCard3DProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const springConfig = { damping: 20, stiffness: 200, mass: 0.6 };

  // Calculate rotation angles based on mouse position relative to center (0 to 1)
  const rotateX = useSpring(useTransform(mouseY, [0, 1], [maxTilt, -maxTilt]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-maxTilt, maxTilt]), springConfig);
  const scale = useSpring(isHovered ? scaleOnHover : 1, springConfig);

  // Dynamic glare coordinates
  const glareX = useTransform(mouseX, [0, 1], ["0%", "100%"]);
  const glareY = useTransform(mouseY, [0, 1], ["0%", "100%"]);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    mouseX.set(Math.min(Math.max(x, 0), 1));
    mouseY.set(Math.min(Math.max(y, 0), 1));
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    onMouseEnter?.();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0.5);
    mouseY.set(0.5);
    onMouseLeave?.();
  };

  return (
    <div
      style={{ perspective: `${perspective}px` }}
      className="inline-block w-full"
      onFocusCapture={onFocusCapture}
      onBlurCapture={onBlurCapture}
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          scale,
          transformStyle: "preserve-3d",
        }}
        className={`relative transition-shadow duration-300 will-change-transform ${className}`}
      >
        {children}

        {/* Specular Glare Effect */}
        {glareEffect && (
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] overflow-hidden opacity-0 transition-opacity duration-300"
            style={{
              opacity: isHovered ? 0.35 : 0,
            }}
          >
            <motion.div
              className="absolute -inset-[100%] h-[300%] w-[300%]"
              style={{
                background: `radial-gradient(circle at ${glareX} ${glareY}, rgba(255,255,255,0.4) 0%, rgba(255,106,0,0.15) 30%, transparent 65%)`,
              }}
            />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
