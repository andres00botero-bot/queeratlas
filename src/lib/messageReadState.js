export function reconcileReadThreads(threads, readThreads) {
  return (Array.isArray(threads) ? threads : []).map((thread) => {
    const readLastMessageAt = readThreads.get(thread.id);
    if (!readLastMessageAt) return thread;
    if (thread.last_message_at !== readLastMessageAt) {
      readThreads.delete(thread.id);
      return thread;
    }
    return { ...thread, unread_count: 0 };
  });
}
