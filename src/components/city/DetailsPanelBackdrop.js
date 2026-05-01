"use client";

export default function DetailsPanelBackdrop({ isOpen, onClose }) {
  if (!isOpen) return null;
  return (
    <button
      type="button"
      aria-label="Close details panel"
      onClick={onClose}
      className="fixed inset-0 z-30 bg-black/55 backdrop-blur-[1px] lg:hidden"
    />
  );
}
