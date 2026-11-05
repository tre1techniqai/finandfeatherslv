
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

type StaffNote = {
  id: string;
  reservation_request_id: string;
  parent_note_id: string | null;
  author_user_id: string;
  author_email: string;
  body: string;
  created_at: string;
};

type NotesResponse = {
  success: boolean;
  notes: StaffNote[];
  totalCount: number;
  unreadCount: number;
  hasMore: boolean;
  error?: string;
};

type NotesContextValue = {
  notes: StaffNote[];
  totalCount: number;
  unreadCount: number;
  loading: boolean;
  loadingMore: boolean;
  saving: boolean;
  acknowledging: boolean;
  hasMore: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  saveNote: (
    body: string,
    parentNoteId?: string | null,
  ) => Promise<boolean>;
  acknowledge: () => Promise<void>;
};

const PAGE_SIZE = 50;

const NotesContext =
  createContext<NotesContextValue | null>(null);

function useStaffNotes() {
  const context = useContext(NotesContext);

  if (!context) {
    throw new Error(
      "Staff notes must be rendered inside ReservationStaffNotesProvider.",
    );
  }

  return context;
}

function formatTimestamp(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/Los_Angeles",
    timeZoneName: "short",
  }).format(date);
}

async function readResponse(
  response: Response,
): Promise<Record<string, unknown>> {
  const value: unknown = await response.json();

  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value)
  ) {
    throw new Error("Unexpected notes API response.");
  }

  return value as Record<string, unknown>;
}

function getError(
  value: Record<string, unknown>,
  fallback: string,
) {
  return typeof value.error === "string"
    ? value.error
    : fallback;
}

export function ReservationStaffNotesProvider({
  reservationId,
  children,
}: {
  reservationId: string;
  children: ReactNode;
}) {
  const [notes, setNotes] = useState<StaffNote[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [saving, setSaving] = useState(false);
  const [acknowledging, setAcknowledging] =
    useState(false);
  const [error, setError] = useState<string | null>(
    null,
  );

  const endpoint =
    `/api/staff/reservations/${encodeURIComponent(reservationId)}/notes`;

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(endpoint, {
        cache: "no-store",
      });

      const data = await readResponse(response);

      if (!response.ok || data.success !== true) {
        throw new Error(
          getError(data, "Unable to load staff notes."),
        );
      }

      const result = data as unknown as NotesResponse;

      setNotes(result.notes ?? []);
      setTotalCount(result.totalCount ?? 0);
      setUnreadCount(result.unreadCount ?? 0);
      setHasMore(result.hasMore === true);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to load staff notes.",
      );
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const loadMore = useCallback(async () => {
    if (loading || loadingMore || !hasMore) {
      return;
    }

    setLoadingMore(true);
    setError(null);

    try {
      const response = await fetch(
        `${endpoint}?offset=${notes.length}`,
        {
          cache: "no-store",
        },
      );

      const data = await readResponse(response);

      if (!response.ok || data.success !== true) {
        throw new Error(
          getError(data, "Unable to load older notes."),
        );
      }

      const result = data as unknown as NotesResponse;

      setNotes((current) => {
        const existing = new Set(
          current.map((note) => note.id),
        );

        return [
          ...current,
          ...(result.notes ?? []).filter(
            (note) => !existing.has(note.id),
          ),
        ];
      });

      setTotalCount(result.totalCount ?? 0);
      setUnreadCount(result.unreadCount ?? 0);
      setHasMore(result.hasMore === true);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to load older notes.",
      );
    } finally {
      setLoadingMore(false);
    }
  }, [
    endpoint,
    hasMore,
    loading,
    loadingMore,
    notes.length,
  ]);

  const saveNote = useCallback(
    async (
      body: string,
      parentNoteId: string | null = null,
    ): Promise<boolean> => {
      setSaving(true);
      setError(null);

      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "same-origin",
          body: JSON.stringify({
            body,
            parentNoteId,
          }),
        });

        const data = await readResponse(response);

        if (!response.ok || data.success !== true) {
          throw new Error(
            getError(data, "Unable to save staff note."),
          );
        }

        await refresh();
        return true;
      } catch (cause) {
        setError(
          cause instanceof Error
            ? cause.message
            : "Unable to save staff note.",
        );

        return false;
      } finally {
        setSaving(false);
      }
    },
    [endpoint, refresh],
  );

  const acknowledge = useCallback(async () => {
    if (notes.length === 0 || unreadCount === 0) {
      return;
    }

    setAcknowledging(true);
    setError(null);

    try {
      // The notes endpoint sorts newest first.
      // Acknowledge only a note returned to this UI.
      const lastSeenNoteId = notes[0].id;

      const response = await fetch(
        `${endpoint}/read`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "same-origin",
          body: JSON.stringify({
            lastSeenNoteId,
          }),
        },
      );

      const data = await readResponse(response);

      if (!response.ok || data.success !== true) {
        throw new Error(
          getError(
            data,
            "Unable to acknowledge staff notes.",
          ),
        );
      }

      await refresh();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to acknowledge staff notes.",
      );
    } finally {
      setAcknowledging(false);
    }
  }, [endpoint, notes, refresh, unreadCount]);

  return (
    <NotesContext.Provider
      value={{
        notes,
        totalCount,
        unreadCount,
        loading,
        loadingMore,
        saving,
        acknowledging,
        hasMore,
        error,
        refresh,
        loadMore,
        saveNote,
        acknowledge,
      }}
    >
      {children}
    </NotesContext.Provider>
  );
}

export function ReservationNotesIndicator() {
  const {
    totalCount,
    unreadCount,
    loading,
  } = useStaffNotes();

  return (
    <div className="min-w-0">
      <dt className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
        Staff Notes
      </dt>

      <dd className="mt-2">
        <a
          href="#reservation-staff-notes"
          className="inline-flex min-h-11 items-center gap-3 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <span>
            NOTES: {loading ? "..." : totalCount}
          </span>

          {!loading && unreadCount > 0 && (
            <span
              aria-label={`${unreadCount} unread staff notes`}
              className="inline-flex min-h-7 min-w-7 items-center justify-center rounded-full bg-emerald-500 px-2 text-xs font-bold text-black"
            >
              {unreadCount}
            </span>
          )}

          <span aria-hidden="true">↓</span>
        </a>
      </dd>
    </div>
  );
}

function NoteComposer({
  onSubmit,
  saving,
  label,
  onCancel,
}: {
  onSubmit: (body: string) => Promise<boolean>;
  saving: boolean;
  label: string;
  onCancel?: () => void;
}) {
  const [body, setBody] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const value = body.trim();

    if (!value || saving) {
      return;
    }

    const saved = await onSubmit(value);

    if (saved) {
      setBody("");
      onCancel?.();
    }
  }

  return (
    <form
      onSubmit={(event) => void handleSubmit(event)}
      className="space-y-3"
    >
      <label className="block text-sm font-semibold text-zinc-200">
        {label}

        <textarea
          value={body}
          onChange={(event) =>
            setBody(event.target.value)
          }
          maxLength={4000}
          rows={3}
          required
          disabled={saving}
          placeholder="Enter an internal staff note..."
          className="mt-2 w-full rounded-lg border border-white/20 bg-black/60 px-3 py-3 text-sm font-normal text-white placeholder:text-zinc-500 focus:border-white/50 focus:outline-none disabled:opacity-60"
        />
      </label>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs text-zinc-500">
          {body.length}/4000 characters
        </span>

        <div className="flex flex-wrap items-center gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              className="min-h-10 rounded-lg border border-white/20 px-4 text-sm font-semibold text-zinc-300 hover:bg-white/10"
            >
              CANCEL
            </button>
          )}

          <button
            type="submit"
            disabled={saving || !body.trim()}
            className="min-h-10 rounded-lg bg-[#ea1b24] px-4 text-sm font-bold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "SAVING..." : "SAVE NOTE"}
          </button>
        </div>
      </div>
    </form>
  );
}

function NoteCard({
  note,
  saveNote,
  saving,
}: {
  note: StaffNote;
  saveNote: (
    body: string,
    parentNoteId?: string | null,
  ) => Promise<boolean>;
  saving: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [replying, setReplying] = useState(false);

  return (
    <article className="rounded-lg border border-white/10 bg-black/40 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="break-all text-xs font-semibold text-white">
            {note.author_email}
          </p>

          {note.parent_note_id && (
            <p className="mt-1 text-xs text-emerald-300">
              Reply to an existing note
            </p>
          )}
        </div>

        <time
          dateTime={note.created_at}
          className="text-xs text-zinc-500"
        >
          {formatTimestamp(note.created_at)}
        </time>
      </div>

      <p
        className={`mt-3 break-words text-sm leading-6 text-zinc-200 ${
          expanded
            ? "whitespace-pre-wrap"
            : "overflow-hidden text-ellipsis whitespace-nowrap"
        }`}
        title={expanded ? undefined : note.body}
      >
        {note.body}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="min-h-9 text-xs font-bold text-emerald-300 underline underline-offset-4 hover:text-emerald-200"
        >
          {expanded ? "HIDE NOTE" : "VIEW NOTE"}
        </button>

        <button
          type="button"
          onClick={() => setReplying((value) => !value)}
          className="min-h-9 text-xs font-bold text-white underline underline-offset-4 hover:text-zinc-300"
        >
          {replying ? "CANCEL REPLY" : "REPLY"}
        </button>
      </div>

      {replying && (
        <div className="mt-4 border-t border-white/10 pt-4">
          <NoteComposer
            label={`Reply to ${note.author_email}`}
            saving={saving}
            onSubmit={(body) =>
              saveNote(body, note.id)
            }
            onCancel={() => setReplying(false)}
          />
        </div>
      )}
    </article>
  );
}

export function ReservationStaffNotesPanel({
  legacyNotes,
}: {
  legacyNotes?: string | null;
}) {
  const {
    notes,
    totalCount,
    unreadCount,
    loading,
    loadingMore,
    saving,
    acknowledging,
    hasMore,
    error,
    refresh,
    loadMore,
    saveNote,
    acknowledge,
  } = useStaffNotes();

  const [showHistory, setShowHistory] =
    useState(false);

  return (
    <section
      id="reservation-staff-notes"
      aria-labelledby="reservation-staff-notes-heading"
      className="scroll-mt-24 rounded-xl border border-white/10 bg-zinc-950/90 p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2
            id="reservation-staff-notes-heading"
            className="text-lg font-bold text-white"
          >
            Staff Notes ({totalCount})
          </h2>

          <p className="mt-1 text-xs text-zinc-400">
            Internal staff communication only.
            Notes are never sent to guests.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void refresh()}
          disabled={loading}
          className="min-h-10 rounded-lg border border-white/20 px-3 text-xs font-semibold text-white hover:bg-white/10 disabled:opacity-50"
        >
          REFRESH NOTES
        </button>
      </div>

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-lg border border-red-500/30 bg-red-950/30 p-3 text-sm text-red-200"
        >
          {error}
        </p>
      )}

      <div className="mt-5">
        <NoteComposer
          label="ADD STAFF NOTE"
          saving={saving}
          onSubmit={(body) => saveNote(body)}
        />
      </div>

      <div className="mt-6 border-t border-white/10 pt-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-white">
            NOTE HISTORY
          </h3>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => void acknowledge()}
              disabled={loading || acknowledging}
              className="min-h-10 rounded-lg border border-emerald-500/40 bg-emerald-950/30 px-3 text-xs font-semibold text-emerald-200 hover:bg-emerald-950/50 disabled:opacity-50"
            >
              {acknowledging
                ? "UPDATING..."
                : `MARK ${unreadCount} UNREAD AS READ`}
            </button>
          )}
        </div>

        {loading && notes.length === 0 ? (
          <p
            role="status"
            className="mt-4 text-sm text-zinc-400"
          >
            Loading staff notes...
          </p>
        ) : notes.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-400">
            No new-format staff notes recorded.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {notes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                saving={saving}
                saveNote={saveNote}
              />
            ))}
          </div>
        )}

        {hasMore && (
          <button
            type="button"
            onClick={() => void loadMore()}
            disabled={loadingMore}
            className="mt-4 min-h-11 w-full rounded-lg border border-white/20 px-4 text-sm font-semibold text-white hover:bg-white/10 disabled:opacity-50"
          >
            {loadingMore
              ? "LOADING..."
              : `LOAD OLDER NOTES (${PAGE_SIZE} AT A TIME)`}
          </button>
        )}
      </div>

      {legacyNotes?.trim() && (
        <div className="mt-6 border-t border-white/10 pt-5">
          <button
            type="button"
            onClick={() =>
              setShowHistory((value) => !value)
            }
            className="min-h-10 text-sm font-semibold text-zinc-300 underline underline-offset-4 hover:text-white"
          >
            {showHistory ? "HIDE" : "VIEW"} HISTORICAL STAFF NOTES
          </button>

          {showHistory && (
            <div className="mt-3 rounded-lg border border-white/10 bg-black/40 p-4">
              <p className="whitespace-pre-wrap break-words text-sm leading-6 text-zinc-300">
                {legacyNotes}
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}