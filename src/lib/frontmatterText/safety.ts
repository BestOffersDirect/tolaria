import { type FrontmatterTextValue, needsKeyQuoting, needsQuoting, rustLines } from './yaml'

/**
 * Property edits the desktop writer would turn into frontmatter that does not read back as
 * written. It quotes with `"` escaping only `"`, and writes all other text as is, so a
 * backslash in quoted text becomes an escape sequence, and a line break or control character
 * in a single-line position ends the line early and can start a key of its own. The web
 * refuses these edits instead of writing different bytes from the desktop's.
 */

type PlainText = string

export class UnsafeFrontmatterEditError extends Error {
  constructor(key: PlainText) {
    super(`The value of ${JSON.stringify(key)} cannot be written to frontmatter safely`)
    this.name = 'UnsafeFrontmatterEditError'
  }
}

const TAB = 0x09
const DELETE = 0x7f
/** NEL, LINE SEPARATOR and PARAGRAPH SEPARATOR: line breaks to YAML 1.1. */
const UNICODE_LINE_BREAKS = new Set([0x85, 0x2028, 0x2029])

/** C0 controls other than tab (so `\n` and `\r` too), and DEL. */
function isControl(code: number): boolean {
  return code < 0x20 ? code !== TAB : code === DELETE
}

function breaksLine(code: number): boolean {
  return isControl(code) || UNICODE_LINE_BREAKS.has(code)
}

function breaksSingleLine(text: PlainText): boolean {
  return [...text].some(char => breaksLine(char.charCodeAt(0)))
}

function isSafeQuoted(text: PlainText): boolean {
  return !breaksSingleLine(text) && !text.includes('\\')
}

function isSafeKey(key: PlainText): boolean {
  return needsKeyQuoting(key) ? isSafeQuoted(key) : !breaksSingleLine(key)
}

/**
 * A block scalar keeps each line indented under the key: a lone `\r` or another line break
 * inside a line would end it, and a first line starting with a space changes the indentation
 * YAML reads.
 */
function isSafeBlockScalar(text: PlainText): boolean {
  const lines = rustLines(text)
  const first = lines.find(line => line !== '') ?? ''
  return !first.startsWith(' ') && lines.every(line => !breaksSingleLine(line))
}

function isSafeString(text: PlainText): boolean {
  if (text.includes('\n')) return isSafeBlockScalar(text)
  return needsQuoting(text) ? isSafeQuoted(text) : !breaksSingleLine(text)
}

function isSafeValue(value: FrontmatterTextValue | undefined): boolean {
  if (Array.isArray(value)) return value.every(isSafeQuoted)
  return typeof value === 'string' ? isSafeString(value) : true
}

/** Throws `UnsafeFrontmatterEditError` for an edit whose desktop bytes would not read back. */
export function assertSafeFrontmatterEdit(key: PlainText, value: FrontmatterTextValue | undefined): void {
  if (!isSafeKey(key) || !isSafeValue(value)) throw new UnsafeFrontmatterEditError(key)
}
