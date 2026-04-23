"use client";

const ACTION_FEEDBACK = {
  favoriteSaved: {
    tone: "ok",
    duration: 1900,
    message: ({ label = "Item" } = {}) => `${label} saved to your atlas.`,
  },
  favoriteRemoved: {
    tone: "info",
    duration: 1900,
    message: ({ label = "Item" } = {}) => `${label} removed from your atlas.`,
  },
  favoriteAlreadySaved: {
    tone: "info",
    duration: 1800,
    message: ({ label = "Item" } = {}) => `${label} is already in your atlas.`,
  },
  checkinSaved: {
    tone: "ok",
    duration: 1900,
    message: "Check-in saved to your atlas.",
  },
  checkinUpdated: {
    tone: "ok",
    duration: 1900,
    message: "Check-in updated.",
  },
  checkinDeleted: {
    tone: "info",
    duration: 1900,
    message: "Check-in deleted.",
  },
  inviteRequested: {
    tone: "ok",
    duration: 1900,
    message: "Invite request sent.",
  },
  inviteAlreadyRequested: {
    tone: "info",
    duration: 1800,
    message: "Invite already requested.",
  },
  inviteAccepted: {
    tone: "ok",
    duration: 1900,
    message: "Invite accepted.",
  },
  inviteDeclined: {
    tone: "info",
    duration: 1900,
    message: "Invite declined.",
  },
  messageSent: {
    tone: "ok",
    duration: 1500,
    message: "Message sent.",
  },
  privateEventPosted: {
    tone: "ok",
    duration: 1900,
    message: "Private event posted.",
  },
};

export function showActionFeedback(showToast, key, context = {}, options = {}) {
  if (typeof showToast !== "function") return;
  const preset = ACTION_FEEDBACK[key];
  if (!preset) return;
  const baseMessage = typeof preset.message === "function" ? preset.message(context) : preset.message;
  if (!baseMessage) return;
  showToast(baseMessage, {
    tone: preset.tone,
    duration: preset.duration,
    ...options,
  });
}

