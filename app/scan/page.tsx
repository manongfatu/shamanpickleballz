"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

async function claimToken(token: string) {
  const res = await fetch("/api/claim-token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
  return { ok: res.ok, data: await res.json() };
}

function ScanContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef<any>(null);

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      handleToken(token);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  async function handleToken(token: string) {
    const { ok, data } = await claimToken(token);
    if (!ok) {
      setError(data.error ?? "Could not claim this court.");
      return;
    }
    localStorage.setItem(
      `scorer:${data.courtId}`,
      JSON.stringify({ scorerSessionId: data.scorerSessionId })
    );
    router.push(`/court/${data.courtId}/scorer`);
  }

  async function startCameraScan() {
    setError(null);
    setScanning(true);
    const { Html5Qrcode } = await import("html5-qrcode");
    const scanner = new Html5Qrcode("qr-reader");
    scannerRef.current = scanner;
    try {
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 240 },
        async (decodedText: string) => {
          await scanner.stop();
          setScanning(false);
          try {
            const url = new URL(decodedText);
            const token = url.searchParams.get("token");
            if (token) await handleToken(token);
            else setError("QR code did not contain a valid court token.");
          } catch {
            setError("Unrecognized QR code.");
          }
        },
        () => {
          /* ignore per-frame scan misses */
        }
      );
    } catch {
      setError("Camera access was denied or unavailable.");
      setScanning(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-12 text-center">
      <h1 className="mb-2 text-2xl font-bold">Scan to Score</h1>
      <p className="mb-6 text-sm text-upnext">
        Point your camera at the court's QR code to become its scorer.
      </p>

      <div
        id="qr-reader"
        className="mx-auto mb-4 aspect-square w-full max-w-xs overflow-hidden rounded-card bg-black/5"
      />

      {!scanning && (
        <button
          onClick={startCameraScan}
          className="tap-target w-full rounded-lg bg-action py-3 font-semibold text-white hover:brightness-110"
        >
          Open camera
        </button>
      )}

      {error && <p className="mt-4 text-sm text-live">{error}</p>}
    </div>
  );
}

export default function ScanPage() {
  return (
    <Suspense
      fallback={<div className="p-6 text-center text-upnext">Loading…</div>}
    >
      <ScanContent />
    </Suspense>
  );
}
