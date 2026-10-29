import type { Dictionary } from "@blocknote/core";
import {
	de,
	en,
	es,
	fr,
	it,
	ja,
	ko,
	pl,
	pt,
	ru,
	sk,
	uk,
	vi,
	zh,
	zhTW,
} from "@blocknote/core/locales";
import { type AppLocale, translate } from "../lib/i18n";

const BLOCKNOTE_DICTIONARIES: Partial<Record<AppLocale, Dictionary>> = {
	"de-DE": de,
	"es-ES": es,
	"es-419": es,
	"fr-FR": fr,
	"it-IT": it,
	"ja-JP": ja,
	"ko-KR": ko,
	"pl-PL": pl,
	"pt-BR": pt,
	"pt-PT": pt,
	"ru-RU": ru,
	"sk-SK": sk,
	"uk-UA": uk,
	vi,
	"zh-CN": zh,
	"zh-TW": zhTW,
};

const SLASH_MENU_LABELS = {
	paragraph: "editor.blockType.paragraph",
	heading: "editor.blockType.heading1",
	heading_2: "editor.blockType.heading2",
	heading_3: "editor.blockType.heading3",
	heading_4: "editor.blockType.heading4",
	heading_5: "editor.blockType.heading5",
	heading_6: "editor.blockType.heading6",
	quote: "editor.blockType.quote",
	bullet_list: "editor.blockType.bulletList",
	numbered_list: "editor.blockType.numberedList",
	check_list: "editor.blockType.checklist",
	code_block: "editor.blockType.codeBlock",
} as const;

const PLACEHOLDER_STYLE_ID = "tolaria-localized-editor-placeholders";

export function createBlockNoteDictionary(
	locale: AppLocale = "en",
): Dictionary {
	const source = BLOCKNOTE_DICTIONARIES[locale] ?? en;
	const dictionary: Dictionary = {
		...source,
		slash_menu: Object.fromEntries(
			Object.entries(source.slash_menu).map(([key, item]) => [
				key,
				{ ...item },
			]),
		) as Dictionary["slash_menu"],
		placeholders: { ...source.placeholders },
	};
	for (const [item, key] of Object.entries(SLASH_MENU_LABELS)) {
		dictionary.slash_menu[item as keyof Dictionary["slash_menu"]].title =
			translate(locale, key);
	}
	dictionary.placeholders.default = translate(locale, "editor.placeholder");
	return dictionary;
}

export function applyBlockNoteLocale(
	editor: { dictionary?: Dictionary; domElement?: HTMLElement },
	locale: AppLocale = "en",
): void {
	const dictionary = createBlockNoteDictionary(locale);
	if (editor.dictionary) Object.assign(editor.dictionary, dictionary);
	if (!document.getElementById(PLACEHOLDER_STYLE_ID)) {
		const style = document.createElement("style");
		style.id = PLACEHOLDER_STYLE_ID;
		style.textContent = `
			.editor__blocknote-container [data-is-empty-and-focused] .bn-inline-content:has(> .ProseMirror-trailingBreak:only-child)::before {
				content: var(--editor-empty-placeholder) !important;
			}
			.editor__blocknote-container [data-content-type="heading"]:not([data-level]) .bn-inline-content:has(> .ProseMirror-trailingBreak:only-child)::before {
				content: var(--editor-title-placeholder, "Title") !important;
			}
		`;
		document.head.append(style);
	}
	if (editor.domElement) {
		editor.domElement.style.setProperty(
			"--editor-empty-placeholder",
			JSON.stringify(dictionary.placeholders.default),
		);
		editor.domElement.style.setProperty(
			"--editor-title-placeholder",
			JSON.stringify(translate(locale, "editor.placeholder.title")),
		);
	}
}
