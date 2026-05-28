export type SyncEventType =
  | "profile_updated"
  | "assessment_saved"
  | "medication_updated"
  | "vitals_logged"
  | "observation_added"
  | "checklist_updated"
  | "report_analysis_saved"
  | "backup_restored";

export interface SyncEvent {
  id: string;
  parentId: string;
  type: SyncEventType;
  createdAt: string;
  status: "pending" | "dismissed" | "simulated_synced";
  source: "local_sandbox";
  metadata: Record<string, any>;
}

const STORAGE_KEY_PREFIX = "parents_health_sync_queue_";
const MAX_QUEUE_SIZE = 100;

/**
 * Retrieve the offline sync event queue scoped by parent ID.
 */
export function getSyncQueue(parentId: string): SyncEvent[] {
  if (typeof window === "undefined" || !parentId) return [];
  try {
    const data = localStorage.getItem(`${STORAGE_KEY_PREFIX}${parentId}`);
    if (!data) return [];
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (e) {
    console.error("[Sync Queue] Failed parsing storage, restoring empty array:", e);
    return [];
  }
}

/**
 * Persist the sync queue locally, keeping size under MAX_QUEUE_SIZE defensively.
 */
export function saveSyncQueue(parentId: string, queue: SyncEvent[]): void {
  if (typeof window === "undefined" || !parentId) return;
  try {
    const truncated = queue.slice(-MAX_QUEUE_SIZE);
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${parentId}`, JSON.stringify(truncated));
  } catch (e) {
    console.error("[Sync Queue] Failed saving to localStorage:", e);
  }
}

/**
 * Queue a new mutation event safely. Enforces strict privacy boundaries.
 */
export function addSyncEvent(parentId: string, type: SyncEventType, metadata: Record<string, any> = {}): void {
  if (!parentId) return;
  const queue = getSyncQueue(parentId);
  
  // Clean and sanitize metadata fields
  const safeMetadata: Record<string, any> = {};
  
  Object.keys(metadata).forEach(key => {
    const val = metadata[key];
    
    // Explicitly sanitize base64 strings, file binaries, and large JSON payloads
    if (
      typeof val === "string" && 
      (val.length > 300 || val.startsWith("data:") || val.startsWith("blob:") || val.includes("base64"))
    ) {
      safeMetadata[key] = "[Redacted: High-Volume Payload Boundary]";
    } else if (val && typeof val === "object" && !Array.isArray(val)) {
      // Small key summary
      safeMetadata[key] = { keys: Object.keys(val) };
    } else {
      safeMetadata[key] = val;
    }
  });

  const newEvent: SyncEvent = {
    id: `sync-evt-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    parentId,
    type,
    createdAt: new Date().toISOString(),
    status: "pending",
    source: "local_sandbox",
    metadata: safeMetadata
  };

  queue.push(newEvent);
  saveSyncQueue(parentId, queue);
}

/**
 * Simulates pushing all pending events to a cloud server.
 */
export function simulateSyncAll(parentId: string): void {
  const queue = getSyncQueue(parentId);
  const updated = queue.map(evt => {
    if (evt.status === "pending") {
      return { ...evt, status: "simulated_synced" as const };
    }
    return evt;
  });
  saveSyncQueue(parentId, updated);
}

/**
 * Dismisses all pending events in the queue log locally.
 */
export function dismissAllSyncEvents(parentId: string): void {
  const queue = getSyncQueue(parentId);
  const updated = queue.map(evt => {
    if (evt.status === "pending") {
      return { ...evt, status: "dismissed" as const };
    }
    return evt;
  });
  saveSyncQueue(parentId, updated);
}

/**
 * Returns the count of pending offline events.
 */
export function getPendingQueueCount(parentId: string): number {
  return getSyncQueue(parentId).filter(evt => evt.status === "pending").length;
}

/**
 * Returns the most recent queued event.
 */
export function getLastQueuedEvent(parentId: string): SyncEvent | null {
  const queue = getSyncQueue(parentId);
  if (queue.length === 0) return null;
  return queue[queue.length - 1];
}

/**
 * Completely drops the event log.
 */
export function resetWholeQueue(parentId: string): void {
  if (typeof window === "undefined" || !parentId) return;
  localStorage.removeItem(`${STORAGE_KEY_PREFIX}${parentId}`);
}
