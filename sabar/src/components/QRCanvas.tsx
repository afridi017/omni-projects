import { useEffect, useRef } from "react";
import QRCode from "qrcode";

export default function QRCanvas({
  value,
  size = 200,
}: {
  value: string;
  size?: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    QRCode.toCanvas(ref.current, value, {
      width: size,
      margin: 2,
      color: {
        dark: "#0b0b12",
        light: "#ffffff",
      },
    }).catch(() => {});
  }, [value, size]);

  return (
    <canvas
      ref={ref}
      style={{ width: size, height: size, borderRadius: 12 }}
      aria-label="QR code — scan to join queue"
    />
  );
}
