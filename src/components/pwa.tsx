"use client";

import { Download, Share } from "lucide-react";
import { useEffect, useState } from "react";

/** Registers the service worker (production only). */
export function ServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);
  return null;
}

type BIPEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

/** "Install app" button: native prompt on Android/desktop Chrome, instructions on iOS. Hidden once installed. */
export function InstallButton({ label, iosHint, className = "btn btn-outline btn-sm w-full" }: { label: string; iosHint: string; className?: string }) {
  const [evt, setEvt] = useState<BIPEvent | null>(null);
  const [ios, setIos] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [installed, setInstalled] = useState(true);

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as unknown as { standalone?: boolean }).standalone;
    setInstalled(!!standalone);
    setIos(/iphone|ipad|ipod/i.test(navigator.userAgent));
    const onPrompt = (e: Event) => { e.preventDefault(); setEvt(e as BIPEvent); };
    const onInstalled = () => setInstalled(true);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => { window.removeEventListener("beforeinstallprompt", onPrompt); window.removeEventListener("appinstalled", onInstalled); };
  }, []);

  if (installed || (!evt && !ios)) return null;
  return (
    <div>
      <button
        type="button"
        className={className}
        onClick={async () => {
          if (evt) { await evt.prompt(); await evt.userChoice; setEvt(null); }
          else setShowHint((s) => !s);
        }}
      >
        <Download className="h-4 w-4" />{label}
      </button>
      {showHint && (
        <p className="mt-2 flex items-center gap-1.5 rounded-xl bg-mint-soft p-3 text-xs font-semibold text-green-deep">
          <Share className="h-4 w-4 shrink-0" />{iosHint}
        </p>
      )}
    </div>
  );
}
