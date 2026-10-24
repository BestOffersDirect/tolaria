import type { VaultEntry } from "../types";
import { NOTE_FORMAT_SHEET, type NoteFormat } from "../utils/noteFormat";
import { canonicalFrontmatterKey } from "../utils/systemMetadata";
import type { TemplateLookupParams } from "./noteCreationBase";

export interface NoteContentParams {
	title: string | null;
	type: string;
	status: string | null;
	format?: NoteFormat;
	template?: string | null;
	initialEmptyHeading?: boolean;
	defaults?: TypeInstanceDefault[];
}

export type DefaultValue = string | number | boolean | string[];

export interface TypeInstanceDefault {
	key: string;
	value: DefaultValue;
	kind: "property" | "relationship";
}

export function buildNoteBody({
	format,
	template,
	initialEmptyHeading,
}: Pick<
	NoteContentParams,
	"format" | "template" | "initialEmptyHeading"
>): string {
	const templateBody = template ? `\n${template}` : "";
	if (format === NOTE_FORMAT_SHEET) return templateBody;
	if (!initialEmptyHeading) return templateBody;
	if (template?.trimStart().startsWith("# ")) return templateBody;
	if (!template) return "\n# \n\n";
	return `\n# \n\n${template}`;
}

function relationshipDefaultValue(refs: string[]): DefaultValue | null {
	if (refs.length === 0) return null;
	return refs.length === 1 ? refs[0] : refs;
}

function isDefaultablePropertyValue(
	value: unknown,
): value is string | number | boolean {
	if (typeof value === "string") return value.trim().length > 0;
	return typeof value === "number" || typeof value === "boolean";
}

function resolveTypeEntry({
	entries,
	typeName,
}: TemplateLookupParams): VaultEntry | undefined {
	return entries.find(
		(entry) => entry.isA === "Type" && entry.title === typeName,
	);
}

function collectPropertyDefaults(typeEntry: VaultEntry): TypeInstanceDefault[] {
	return Object.entries(typeEntry.properties ?? {}).flatMap(([key, value]) =>
		isDefaultablePropertyValue(value)
			? [{ key, value, kind: "property" as const }]
			: [],
	);
}

function collectRelationshipDefaults(
	typeEntry: VaultEntry,
): TypeInstanceDefault[] {
	return Object.entries(typeEntry.relationships ?? {}).flatMap(
		([key, refs]) => {
			const value = relationshipDefaultValue(refs);
			return value ? [{ key, value, kind: "relationship" as const }] : [];
		},
	);
}

function appendUniqueDefault(
	defaults: TypeInstanceDefault[],
	seenKeys: Set<string>,
	defaultValue: TypeInstanceDefault,
) {
	const canonicalKey = canonicalFrontmatterKey(defaultValue.key);
	if (canonicalKey === "type" || canonicalKey === "title") return;
	if (seenKeys.has(canonicalKey)) return;
	seenKeys.add(canonicalKey);
	defaults.push(defaultValue);
}

export function resolveTypeInstanceDefaults(
	params: TemplateLookupParams,
): TypeInstanceDefault[] {
	const typeEntry = resolveTypeEntry(params);
	if (!typeEntry) return [];

	const defaults: TypeInstanceDefault[] = [];
	const seenKeys = new Set<string>();
	const candidateDefaults = [
		...collectPropertyDefaults(typeEntry),
		...collectRelationshipDefaults(typeEntry),
	];
	for (const defaultValue of candidateDefaults) {
		appendUniqueDefault(defaults, seenKeys, defaultValue);
	}
	return defaults;
}
