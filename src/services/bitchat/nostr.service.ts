import {
  SimplePool,
  finalizeEvent,
  generateSecretKey,
  getPublicKey,
  type Event as NostrEvent,
} from "nostr-tools";

// ── RCCG Holy Ghost Congress channel config ───────────────────────────────────
export const HGC_TAG = "RedemptionCityHGC2024";
export const HGC_ZONE_TAG = "hgc-zone";

// Public relays — we use 3 for redundancy
export const NOSTR_RELAYS = [
  "wss://relay.damus.io",
  "wss://nos.lol",
  "wss://relay.nostr.band",
];

export interface BitChatMessage {
  id: string;
  pubkey: string;           // Nostr pubkey (hex)
  senderName: string;       // Embedded display name tag
  content: string;
  zone?: string;            // Optional RCCG zone tag
  createdAt: Date;
  isOwn?: boolean;
}

// ── NostrService ─────────────────────────────────────────────────────────────
export class NostrService {
  private pool = new SimplePool();
  /** Ephemeral keypair — regenerated per session, tied to the logged-in user's display name */
  private sk: Uint8Array;
  public pk: string;
  private displayName: string;
  private sub: { close(): void } | null = null;

  constructor(displayName: string) {
    this.displayName = displayName;
    this.sk = generateSecretKey();
    this.pk = getPublicKey(this.sk);
  }

  /**
   * Subscribe to the HGC channel.
   * @param onMessage   Called for every new message received
   * @param onConnected Called when at least one relay responds
   * @param onError     Called on relay errors
   */
  subscribe(
    onMessage: (msg: BitChatMessage) => void,
    onConnected?: () => void,
    onError?: (err: string) => void
  ) {
    try {
      // Fetch last 100 messages then stream new ones
      this.sub = this.pool.subscribeMany(
        NOSTR_RELAYS,
        [
          {
            kinds: [1],
            "#t": [HGC_TAG],
            limit: 100,
          },
        ],
        {
          onevent: (event: NostrEvent) => {
            onConnected?.();
            onMessage(this._parseEvent(event));
          },
          onerror: (relay: string, err: Event) => {
            console.warn(`[BitChat] Relay error on ${relay}:`, err);
            onError?.(`Relay unreachable: ${relay}`);
          },
        } as Parameters<typeof this.pool.subscribeMany>[2]
      );
    } catch (err) {
      onError?.("Failed to connect to Nostr relays");
    }
  }

  /** Publish a message to the HGC channel */
  async publish(content: string, zone?: string): Promise<BitChatMessage> {
    const tags: string[][] = [
      ["t", HGC_TAG],
      ["name", this.displayName],
    ];
    if (zone) tags.push([HGC_ZONE_TAG, zone]);

    const event = finalizeEvent(
      {
        kind: 1,
        created_at: Math.floor(Date.now() / 1000),
        tags,
        content,
      },
      this.sk
    );

    // Attempt publish to all relays — succeed if at least one accepts
    await Promise.any(this.pool.publish(NOSTR_RELAYS, event)).catch(() => {
      throw new Error("All relays rejected the message");
    });

    return this._parseEvent(event);
  }

  /** Clean up subscription and close relay connections */
  destroy() {
    this.sub?.close();
    this.pool.close(NOSTR_RELAYS);
  }

  private _parseEvent(event: NostrEvent): BitChatMessage {
    const nameTag = event.tags.find((t) => t[0] === "name");
    const zoneTag = event.tags.find((t) => t[0] === HGC_ZONE_TAG);
    return {
      id: event.id,
      pubkey: event.pubkey,
      senderName: nameTag?.[1] ?? `${event.pubkey.slice(0, 6)}…`,
      content: event.content,
      zone: zoneTag?.[1],
      createdAt: new Date(event.created_at * 1000),
      isOwn: event.pubkey === this.pk,
    };
  }
}
