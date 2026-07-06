"use client";

import { useEffect, useRef } from "react";
import QRCode from "qrcode";

export default function QRCodeDisplay({
  value,
  size = 220,
}: {
  value: string;
  size?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, value, {
        width: size,
        margin: 1,
        color: { dark: "#0B1220", light: "#FFFFFF" },
      });
    }
  }, [value, size]);

  return (
    <canvas
      ref={canvasRef}
      className="mx-auto rounded-card shadow-card"
      aria-label="Scan to claim this court as scorer"
    />
  );
}
