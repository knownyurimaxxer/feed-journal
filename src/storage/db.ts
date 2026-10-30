/**
 * Internal database (SQLite). Holds everything that is NOT note text:
 *   - likes: fake like counts, keyed by note id (the .md file name)
 *   - note_meta: creation time, keyed by note id (tags live in the .md file)
 *   - settings: theme, likes toggle, chosen folder
 */
import * as SQLite from "expo-sqlite";

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

function getDb(): Promise<SQLite.SQLiteDatabase> {
	if (!dbPromise) {
		dbPromise = (async () => {
			const db = await SQLite.openDatabaseAsync("feed-journal.db");
			await db.execAsync(`
        CREATE TABLE IF NOT EXISTS likes (
          note_id TEXT PRIMARY KEY NOT NULL,
          count   INTEGER NOT NULL DEFAULT 0
        );
        CREATE TABLE IF NOT EXISTS note_meta (
          note_id    TEXT PRIMARY KEY NOT NULL,
          created_at INTEGER NOT NULL
        );
        CREATE TABLE IF NOT EXISTS settings (
          key   TEXT PRIMARY KEY NOT NULL,
          value TEXT NOT NULL
        );
      `);
			return db;
		})();
	}
	return dbPromise;
}

/** Opens the database ahead of time so the first real query doesn't wait for it. */
export function warmDb(): void {
	getDb().catch((e) => console.warn("Could not open the database", e));
}

/* ---- likes ---- */

export async function getAllLikes(): Promise<Record<string, number>> {
	const db = await getDb();
	const rows = await db.getAllAsync<{ note_id: string; count: number }>(
		"SELECT note_id, count FROM likes",
	);
	const out: Record<string, number> = {};
	rows.forEach((r) => {
		out[r.note_id] = r.count;
	});
	return out;
}

export async function addLikes(deltas: Record<string, number>): Promise<void> {
	const db = await getDb();
	await db.withTransactionAsync(async () => {
		for (const [id, n] of Object.entries(deltas)) {
			await db.runAsync(
				"INSERT INTO likes (note_id, count) VALUES (?, ?) ON CONFLICT(note_id) DO UPDATE SET count = count + excluded.count",
				[id, n],
			);
		}
	});
}

/* ---- per-note metadata (creation time) ---- */

export type NoteMeta = { createdAt: number };

export async function getAllMeta(): Promise<Record<string, NoteMeta>> {
	const db = await getDb();
	const rows = await db.getAllAsync<{
		note_id: string;
		created_at: number;
	}>("SELECT note_id, created_at FROM note_meta");
	const out: Record<string, NoteMeta> = {};
	rows.forEach((r) => {
		out[r.note_id] = { createdAt: r.created_at };
	});
	return out;
}

export async function saveMeta(noteId: string, meta: NoteMeta): Promise<void> {
	const db = await getDb();
	await db.runAsync(
		"INSERT INTO note_meta (note_id, created_at) VALUES (?, ?) ON CONFLICT(note_id) DO UPDATE SET created_at = excluded.created_at",
		[noteId, meta.createdAt],
	);
}

/** Adds metadata for files we haven't seen before. Never overwrites existing rows. */
export async function seedMeta(
	entries: Record<string, NoteMeta>,
): Promise<void> {
	const db = await getDb();
	await db.withTransactionAsync(async () => {
		for (const [id, m] of Object.entries(entries)) {
			await db.runAsync(
				"INSERT OR IGNORE INTO note_meta (note_id, created_at) VALUES (?, ?)",
				[id, m.createdAt],
			);
		}
	});
}

/** A note was renamed (its file name is its id): carry likes and metadata over. */
export async function moveNoteData(
	oldId: string,
	newId: string,
): Promise<void> {
	const db = await getDb();
	await db.withTransactionAsync(async () => {
		await db.runAsync("DELETE FROM likes WHERE note_id = ?", [newId]);
		await db.runAsync("UPDATE likes SET note_id = ? WHERE note_id = ?", [
			newId,
			oldId,
		]);
		await db.runAsync("DELETE FROM note_meta WHERE note_id = ?", [newId]);
		await db.runAsync(
			"UPDATE note_meta SET note_id = ? WHERE note_id = ?",
			[newId, oldId],
		);
	});
}

export async function deleteNoteData(noteId: string): Promise<void> {
	const db = await getDb();
	await db.runAsync("DELETE FROM likes WHERE note_id = ?", [noteId]);
	await db.runAsync("DELETE FROM note_meta WHERE note_id = ?", [noteId]);
}

/* ---- settings (JSON-encoded key/value) ---- */

export async function getSetting<T>(key: string, fallback: T): Promise<T> {
	try {
		const db = await getDb();
		const row = await db.getFirstAsync<{ value: string }>(
			"SELECT value FROM settings WHERE key = ?",
			[key],
		);
		return row ? (JSON.parse(row.value) as T) : fallback;
	} catch {
		return fallback;
	}
}

/** Every saved setting in one query (instead of one query per setting). */
export async function getAllSettings(): Promise<Record<string, unknown>> {
	const out: Record<string, unknown> = {};
	try {
		const db = await getDb();
		const rows = await db.getAllAsync<{ key: string; value: string }>(
			"SELECT key, value FROM settings",
		);
		rows.forEach((r) => {
			try {
				out[r.key] = JSON.parse(r.value);
			} catch {
				/* unreadable value: behaves as if it was never saved */
			}
		});
	} catch {
		/* no database: every setting falls back to its default */
	}
	return out;
}

export async function setSetting(key: string, value: unknown): Promise<void> {
	const db = await getDb();
	await db.runAsync(
		"INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
		[key, JSON.stringify(value)],
	);
}

/** Empties every table (likes, note dates, settings). The tables themselves stay. */
export async function resetDb(): Promise<void> {
	const db = await getDb();
	await db.withTransactionAsync(async () => {
		await db.runAsync("DELETE FROM likes");
		await db.runAsync("DELETE FROM note_meta");
		await db.runAsync("DELETE FROM settings");
	});
}
