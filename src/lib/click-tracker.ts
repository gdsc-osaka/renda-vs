import { runTransaction } from "firebase/database";
import { countRef } from "./game-state";
import { AUTO_CLICK_THRESHOLD } from "./firebase";

export interface ClickTrackerOptions {
  playerId: string;
  onAutoClickerDetected: () => void;
  onSendError?: (err: unknown) => void;
}

export class ClickTracker {
  private bucket = 0;
  private intervalId: number | null = null;
  private active = false;
  private locked = false;
  private readonly opts: ClickTrackerOptions;

  constructor(opts: ClickTrackerOptions) {
    this.opts = opts;
  }

  start() {
    if (this.intervalId != null) return;
    this.active = true;
    this.locked = false;
    this.bucket = 0;
    this.intervalId = window.setInterval(() => this.flush(), 1000);
  }

  stop() {
    if (this.intervalId != null) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.active = false;
    this.flush();
  }

  tap(): boolean {
    if (!this.active || this.locked) return false;
    this.bucket++;
    return true;
  }

  isLocked() {
    return this.locked;
  }

  private async flush() {
    if (this.bucket === 0) return;
    if (this.bucket > AUTO_CLICK_THRESHOLD) {
      this.locked = true;
      this.active = false;
      this.bucket = 0;
      this.opts.onAutoClickerDetected();
      return;
    }
    const delta = this.bucket;
    this.bucket = 0;
    try {
      await runTransaction(countRef(this.opts.playerId), (curr) => {
        return (typeof curr === "number" ? curr : 0) + delta;
      });
    } catch (err) {
      this.opts.onSendError?.(err);
    }
  }
}
