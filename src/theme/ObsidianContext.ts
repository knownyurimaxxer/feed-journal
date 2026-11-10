import { createContext, useContext } from "react";

/**
 * off: Obsidian is turned off, or no vault folder is chosen (it needs both).
 * indexing: looking for the pictures. unreadable: the vault folder can't be opened.
 */
export type ObsidianStatus = "off" | "indexing" | "unreadable" | "ready";

export type ObsidianApi = {
	enabled: boolean;
	status: ObsidianStatus;
	/** File URI of a vault picture ("photo.png", "Attachments/photo.png"), or null if there is none. */
	resolveImage: (path: string) => string | null;
	/** Tells the picture list about a file the app just saved in the vault, so it shows without a rescan. */
	registerFile: (path: string, uri: string) => void;
};

export const ObsidianContext = createContext<ObsidianApi>({
	enabled: false,
	status: "off",
	resolveImage: () => null,
	registerFile: () => {},
});
export const useObsidian = () => useContext(ObsidianContext);
