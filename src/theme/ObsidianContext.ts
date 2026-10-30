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
};

export const ObsidianContext = createContext<ObsidianApi>({
	enabled: false,
	status: "off",
	resolveImage: () => null,
});
export const useObsidian = () => useContext(ObsidianContext);
