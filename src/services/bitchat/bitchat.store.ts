import { create } from "zustand";
import { NostrService, BitChatMessage } from "./nostr.service";

export type RelayStatus = "idle" | "connecting" | "connected" | "error";

interface BitChatState {
  messages: BitChatMessage[];
  status: RelayStatus;
  error: string | null;
  service: NostrService | null;

  // Actions
  init: (displayName: string) => void;
  send: (content: string, zone?: string) => Promise<void>;
  destroy: () => void;
  clearError: () => void;
}

export const useBitChatStore = create<BitChatState>((set, get) => ({
  messages: [],
  status: "idle",
  error: null,
  service: null,

  init(displayName: string) {
    // Don't double-init
    if (get().service) return;

    set({ status: "connecting", error: null });
    const service = new NostrService(displayName);

    service.subscribe(
      // onMessage — prepend so newest is on top (we'll reverse in render)
      (msg) => {
        set((s) => ({
          messages: dedupeAndSort([msg, ...s.messages]),
          status: "connected",
        }));
      },
      // onConnected
      () => set({ status: "connected" }),
      // onError
      (err) => set({ status: "error", error: err })
    );

    set({ service });
  },

  async send(content, zone) {
    const { service } = get();
    if (!service) throw new Error("BitChat not initialized");
    const msg = await service.publish(content, zone);
    // Optimistically add our own message
    set((s) => ({ messages: dedupeAndSort([msg, ...s.messages]) }));
  },

  destroy() {
    get().service?.destroy();
    set({ service: null, status: "idle", messages: [], error: null });
  },

  clearError() {
    set({ error: null });
  },
}));

// Deduplicate by id and sort oldest → newest
function dedupeAndSort(msgs: BitChatMessage[]): BitChatMessage[] {
  const seen = new Set<string>();
  return msgs
    .filter((m) => {
      if (seen.has(m.id)) return false;
      seen.add(m.id);
      return true;
    })
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    .slice(-200); // keep last 200 messages max
}
