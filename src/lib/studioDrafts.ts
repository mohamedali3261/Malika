import type { SiteSettings } from "@/types";
import type { SiteContent } from "@/types/content";

/**
 * Some studio editors keep a working copy until their own Save button is
 * pressed. The Publish button must not silently leave those edits behind, so
 * each editor registers itself here: Publish asks every one to commit first and
 * receives the committed values directly — no waiting for React to re-render.
 */
export interface DraftOverrides {
  content?: SiteContent;
  settings?: SiteSettings;
}

interface Draft {
  isDirty: () => boolean;
  commit: () => DraftOverrides;
}

const drafts = new Set<Draft>();
const listeners = new Set<() => void>();
let version = 0;

const emit = () => {
  version += 1;
  listeners.forEach((listener) => listener());
};

export function registerDraft(draft: Draft): () => void {
  drafts.add(draft);
  emit();
  return () => {
    drafts.delete(draft);
    emit();
  };
}

/** Editors call this whenever their dirty state may have changed. */
export const draftsChanged = emit;

export const subscribeDrafts = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

/** Snapshot for useSyncExternalStore: how many editors hold unsaved edits. */
export const countDirtyDrafts = (): number => {
  void version;
  let count = 0;
  drafts.forEach((draft) => {
    if (draft.isDirty()) count += 1;
  });
  return count;
};

export function commitDrafts(): DraftOverrides {
  const result: DraftOverrides = {};
  drafts.forEach((draft) => {
    if (draft.isDirty()) Object.assign(result, draft.commit());
  });
  return result;
}
