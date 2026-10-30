import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, AppState } from "react-native";
import { MessageKey, translate } from "../i18n";
import { Directory } from "expo-file-system";
import {
	NoteMeta,
	addLikes,
	deleteNoteData,
	getAllLikes,
	getAllMeta,
	moveNoteData,
	saveMeta,
	seedMeta,
} from "../storage/db";
import {
	createNote,
	deleteAllNotes,
	deleteNote,
	readAllNotes,
	renameNote,
	resolveDirectory,
	rewriteNote,
} from "../storage/notesFolder";
import { Draft, Note } from "../types";
import { newNoteId } from "../utils/format";
import { toggleTaskLine } from "../utils/markdownEdit";
import {
	cleanTitle,
	composeNote,
	fileNameFromTitle,
	parseNote,
	titleFromId,
	uniqueName,
} from "../utils/noteText";

/**
 * Owns the list of notes.
 *   - the .md file holds the text and the tags (front matter), its name is the title
 *   - SQLite holds the creation date and the likes
 * Re-reads the folder on start, on pull-to-refresh, and when the app returns
 * to the foreground (so edits made in other apps show up).
 */
export function useNotes(folderUri: string | null, likesEnabled: boolean) {
	const [notes, setNotes] = useState<Note[]>([]);
	const [loading, setLoading] = useState(true);
	const [usingFallback, setUsingFallback] = useState(false);

	const dirRef = useRef<Directory | null>(null);
	const notesRef = useRef<Note[]>(notes);
	notesRef.current = notes;
	const seen = useRef(new Set<string>()); // notes already "revisited" this session
	const likesEnabledRef = useRef(likesEnabled);
	likesEnabledRef.current = likesEnabled;

	const refresh = useCallback(async () => {
		try {
			const { dir, usingFallback } = resolveDirectory(folderUri);
			dirRef.current = dir;
			setUsingFallback(usingFallback);
			const [raw, likes, meta] = await Promise.all([
				readAllNotes(dir),
				getAllLikes(),
				getAllMeta(),
			]);

			const seeds: Record<string, NoteMeta> = {};
			const next: Note[] = raw.map((r) => {
				const { body, tags, extra } = parseNote(r.text);
				let m = meta[r.id];
				if (!m) {
					// First time we see this file: remember its date.
					m = { createdAt: r.createdAt };
					seeds[r.id] = m;
				}
				return {
					...r,
					createdAt: m.createdAt,
					title: titleFromId(r.id),
					body,
					tags,
					extra,
					likes: likes[r.id] ?? 0,
				};
			});
			setNotes(next);
			if (Object.keys(seeds).length > 0) {
				seedMeta(seeds).catch((e) =>
					console.warn("Could not save meta", e),
				);
			}
		} catch (e) {
			console.warn("Refresh failed", e);
		} finally {
			setLoading(false);
		}
	}, [folderUri]);

	useEffect(() => {
		refresh();
	}, [refresh]);

	useEffect(() => {
		const sub = AppState.addEventListener("change", (state) => {
			if (state === "active") refresh();
		});
		return () => sub.remove();
	}, [refresh]);

	// The callbacks below keep an old copy of this function, so it reads the
	// language in use when it runs (translate), not when it was created.
	const fail = (title: MessageKey, e: unknown) => {
		console.warn(title, e);
		Alert.alert(
			translate(title),
			String(e instanceof Error ? e.message : e),
		);
	};

	const addNote = useCallback(
		(draft: Draft) => {
			try {
				const dir = dirRef.current ?? resolveDirectory(folderUri).dir;
				const text = composeNote(draft.body, draft.tags);

				// Named notes are saved under their title, unnamed ones under date and time.
				const base = fileNameFromTitle(draft.title);
				const taken = new Set(
					notesRef.current.map((n) => n.id.toLowerCase()),
				);
				const raw = createNote(
					dir,
					base ? uniqueName(base, taken) : newNoteId(),
					text,
				);

				seen.current.add(raw.id); // brand-new posts start at 0 likes, as is tradition
				saveMeta(raw.id, { createdAt: raw.createdAt }).catch((e) =>
					console.warn("Could not save meta", e),
				);
				setNotes((ns) => [
					{
						...raw,
						title: titleFromId(raw.id),
						body: draft.body,
						tags: draft.tags,
						extra: [],
						likes: 0,
					},
					...ns,
				]);
				return true;
			} catch (e) {
				fail("error.savePost", e);
				return false;
			}
		},
		[folderUri],
	);

	const editNote = useCallback(
		(note: Note, draft: Draft) => {
			try {
				const title = cleanTitle(draft.title);
				const text = composeNote(draft.body, draft.tags, note.extra);
				const dir = dirRef.current ?? resolveDirectory(folderUri).dir;
				let id = note.id;
				let uri = note.uri;

				if ((title || null) !== note.title) {
					// The name changed, so the file name follows it. Clearing the name
					// goes back to a date/time name based on when the note was created.
					const base = fileNameFromTitle(title);
					const taken = new Set(
						notesRef.current
							.filter((n) => n.id !== note.id)
							.map((n) => n.id.toLowerCase()),
					);
					const target = base
						? uniqueName(base, taken)
						: newNoteId(new Date(note.createdAt));
					if (target.toLowerCase() !== note.id.toLowerCase()) {
						({ id, uri } = renameNote(dir, note.uri, target, text));
					} else {
						({ id, uri } = rewriteNote(
							dir,
							note.uri,
							note.text,
							text,
						));
					}
				} else {
					({ id, uri } = rewriteNote(dir, note.uri, note.text, text));
				}

				if (id !== note.id) {
					seen.current.add(id);
					moveNoteData(note.id, id).catch((e) =>
						console.warn("Could not move note data", e),
					);
				}

				setNotes((ns) =>
					ns.map((n) =>
						n.id === note.id
							? {
									...n,
									id,
									uri,
									text,
									title: titleFromId(id),
									body: draft.body,
									tags: draft.tags,
									modifiedAt: Date.now(),
								}
							: n,
					),
				);
				return true;
			} catch (e) {
				fail("error.saveChanges", e);
				return false;
			}
		},
		[folderUri],
	);

	/**
	 * Ticks or unticks the checklist item on `line` (0-based) of a post's text,
	 * straight from the feed. The file keeps its name, whatever it is called.
	 */
	const toggleTask = useCallback(
		(note: Note, line: number) => {
			try {
				const body = toggleTaskLine(note.body, line);
				if (body === note.body) return;
				const text = composeNote(body, note.tags, note.extra);
				const dir = dirRef.current ?? resolveDirectory(folderUri).dir;
				const { id, uri } = rewriteNote(dir, note.uri, note.text, text);
				if (id !== note.id) {
					seen.current.add(id);
					moveNoteData(note.id, id).catch((e) =>
						console.warn("Could not move note data", e),
					);
				}
				setNotes((ns) =>
					ns.map((n) =>
						n.id === note.id
							? {
									...n,
									id,
									uri,
									title: titleFromId(id),
									text,
									body,
									modifiedAt: Date.now(),
								}
							: n,
					),
				);
			} catch (e) {
				fail("error.saveChanges", e);
			}
		},
		[folderUri],
	);

	const removeNote = useCallback((note: Note) => {
		try {
			deleteNote(note.uri);
			deleteNoteData(note.id).catch(() => {});
			setNotes((ns) => ns.filter((n) => n.id !== note.id));
		} catch (e) {
			fail("error.deletePost", e);
		}
	}, []);

	/** Deletes every note file in the folder in use and in app storage. Returns how many. */
	const wipeAll = useCallback(() => {
		const dirs = [
			dirRef.current ?? resolveDirectory(folderUri).dir,
			resolveDirectory(null).dir,
		];
		const done = new Set<string>();
		let count = 0;
		for (const d of dirs) {
			if (done.has(d.uri)) continue;
			done.add(d.uri);
			count += deleteAllNotes(d);
		}
		seen.current.clear();
		setNotes([]);
		return count;
	}, [folderUri]);

	/** Fake likes: +1 (sometimes +2) the first time a note scrolls into view each session. */
	const registerViews = useCallback((ids: string[]) => {
		if (!likesEnabledRef.current) return;
		const deltas: Record<string, number> = {};
		for (const id of ids) {
			if (seen.current.has(id)) continue;
			seen.current.add(id);
			deltas[id] = 1 + (Math.random() < 0.3 ? 1 : 0);
		}
		if (Object.keys(deltas).length === 0) return;
		setNotes((ns) =>
			ns.map((n) =>
				deltas[n.id] ? { ...n, likes: n.likes + deltas[n.id] } : n,
			),
		);
		addLikes(deltas).catch((e) => console.warn("Could not save likes", e));
	}, []);

	return {
		notes,
		loading,
		usingFallback,
		refresh,
		addNote,
		editNote,
		toggleTask,
		removeNote,
		wipeAll,
		registerViews,
	};
}
