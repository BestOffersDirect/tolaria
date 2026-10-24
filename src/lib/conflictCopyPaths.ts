/** `notes/a (conflict 2026-10-10 1903).md`, or `… 1903 2).md`: the name the Tolaria server gives a conflict copy. */
const CONFLICT_COPY_NAME =
	/ \(conflict \d{4}-\d{2}-\d{2} \d{4}(?: \d+)?\)(?:\.[^./]+)?$/u;

export function isConflictCopyPath(path: string): boolean {
	return CONFLICT_COPY_NAME.test(path);
}

/** The file name of a path, for telling people which file holds a conflict copy. */
export function fileNameOf(path: string): string {
	return path.slice(path.lastIndexOf("/") + 1);
}
