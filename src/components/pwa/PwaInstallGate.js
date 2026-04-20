"use client";

import { useEffect, useState } from "react";

const INSTALL_CHOICE_KEY = "qa_pwa_install_choice_v1";

function isStandalone() {
  if (typeof window === "undefined") return false;
  const iosStandalone = window.navigator.standalone === true;
  const displayModeStandalone = window.matchMedia("(display-mode: standalone)").matches;
  return iosStandalone || displayModeStandalone;
}

export default function PwaInstallGate() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    if (isStandalone()) return undefined;

    const existingChoice = window.localStorage.getItem(INSTALL_CHOICE_KEY);
    if (existingChoice === "no" || existingChoice === "yes") return undefined;

    const onBeforeInstallPrompt = (event) => {
      event.preventDefault();
      if (window.localStorage.getItem(INSTALL_CHOICE_KEY)) return;
      setDeferredPrompt(event);
      setIsVisible(true);
    };

    const onAppInstalled = () => {
      window.localStorage.setItem(INSTALL_CHOICE_KEY, "yes");
      setDeferredPrompt(null);
      setIsVisible(false);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice?.outcome === "accepted") {
      window.localStorage.setItem(INSTALL_CHOICE_KEY, "yes");
      setIsVisible(false);
      setDeferredPrompt(null);
      return;
    }
    setIsVisible(true);
  };

  const handleDismiss = () => {
    window.localStorage.setItem(INSTALL_CHOICE_KEY, "no");
    setIsVisible(false);
  };

  if (!isVisible || !deferredPrompt) return null;

  return (
    <div className="fixed inset-x-4 bottom-4 z-[120] sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-[24rem]">
      <div className="rounded-2xl border border-cyan-300/25 bg-[#05080bcc] p-4 text-white shadow-[0_18px_46px_rgba(0,0,0,0.45)] backdrop-blur">
        <p className="text-sm font-semibold tracking-[0.12em] text-cyan-200 uppercase">Install Queer Atlas</p>
        <p className="mt-2 text-sm text-white/85">
          Add app icon to your home screen for one-tap access and faster launch.
        </p>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={handleInstall}
            className="inline-flex flex-1 items-center justify-center rounded-xl border border-cyan-200/35 bg-cyan-300/20 px-3 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300/28"
          >
            Yes, install
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            className="inline-flex flex-1 items-center justify-center rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm font-semibold text-white/85 transition hover:bg-white/16"
          >
            No, thanks
          </button>
        </div>
      </div>
    </div>
  );
}

