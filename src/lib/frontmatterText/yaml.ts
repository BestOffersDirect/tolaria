/**
 * YAML formatting of the desktop writer (`src-tauri/src/frontmatter/yaml.rs`), ported as is
 * so a property written on the web has the bytes the desktop would write. Keep the two in step.
 */

/** What a property can be set to: the shape the desktop `FrontmatterValue` accepts. */
export type FrontmatterTextValue = string | number | boolean | string[] | null

/** A string value or key as the user typed it, before YAML formatting. */
type PlainText = string
/** Text formatted for a YAML frontmatter line. */
type YamlText = string

/** Rust's `str::parse::<f64>` grammar: no whitespace, no hex, an optional exponent, inf and NaN. */
const RUST_FLOAT = /^[+-]?(?:inf|infinity|nan|(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?)$/i

const YAML_KEYWORDS = new Set(['true', 'false', 'null'])

const QUOTING_RULES: readonly ((text: PlainText) => boolean)[] = [
  text => text.includes(':') || text.includes('#'),
  text => text.startsWith('[') || text.startsWith('{'),
  text => YAML_KEYWORDS.has(text),
  text => RUST_FLOAT.test(text),
]

/** True when the desktop writes this single-line string value in double quotes. */
export function needsQuoting(text: PlainText): boolean {
  return QUOTING_RULES.some(rule => rule(text))
}

function quoted(text: PlainText): YamlText {
  return `"${text.replaceAll('"', '\\"')}"`
}

/** Rust's `str::lines`: split on `\n`, drop one trailing `\r` per line and a final empty line. */
export function rustLines(text: PlainText): PlainText[] {
  const lines = text.split('\n').map(line => (line.endsWith('\r') ? line.slice(0, -1) : line))
  if (lines.at(-1) === '') lines.pop()
  return lines
}

function blockScalar(text: PlainText): YamlText {
  return `|\n${rustLines(text).map(line => (line === '' ? '' : `  ${line}`)).join('\n')}`
}

/** True when the desktop writes this key in double quotes. */
export function needsKeyQuoting(key: PlainText): boolean {
  return /[^A-Za-z0-9_-]/.test(key)
}

export function formatYamlKey(key: PlainText): YamlText {
  return needsKeyQuoting(key) ? quoted(key) : key
}

const I64_MAX = 9223372036854775807n
const I64_MIN = -9223372036854775808n

/** Rust's saturating `n as i64`, printed. */
function integerText(value: number): YamlText {
  if (value >= 2 ** 63) return I64_MAX.toString()
  if (value < -(2 ** 63)) return I64_MIN.toString()
  return BigInt(value).toString()
}

/** Rust's `{}` for a fractional f64: the shortest round-trip digits, never in exponent form. */
function fractionText(value: number): YamlText {
  const text = String(value)
  const exponent = /^(-?)(\d)(?:\.(\d+))?e-(\d+)$/.exec(text)
  if (!exponent) return text
  const [, sign, lead, rest = '', power] = exponent
  return `${sign}0.${'0'.repeat(Number(power) - 1)}${lead}${rest}`
}

/** Rust's `{}` for NaN and the infinities. */
function nonFiniteText(value: number): YamlText {
  if (Number.isNaN(value)) return 'NaN'
  return value > 0 ? 'inf' : '-inf'
}

function formatYamlNumber(value: number): YamlText {
  if (!Number.isFinite(value)) return nonFiniteText(value)
  return Number.isInteger(value) ? integerText(value) : fractionText(value)
}

function formatYamlString(text: PlainText): YamlText {
  if (text.includes('\n')) return blockScalar(text)
  return needsQuoting(text) ? quoted(text) : text
}

function formatYamlList(items: readonly PlainText[]): YamlText {
  if (items.length === 0) return '[]'
  return items.map(item => `  - ${quoted(item)}`).join('\n')
}

export function toYamlValue(value: FrontmatterTextValue): YamlText {
  if (value === null) return 'null'
  if (Array.isArray(value)) return formatYamlList(value)
  if (typeof value === 'number') return formatYamlNumber(value)
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  return formatYamlString(value)
}

function isNonEmptyList(value: FrontmatterTextValue): value is string[] {
  return Array.isArray(value) && value.length > 0
}

/**
 * A key and its value as YAML lines: a non-empty list's items go on the line after the key.
 * A list's items and a block scalar's lines stay joined by `\n`, as on the desktop.
 */
export function formatYamlField(key: PlainText, value: FrontmatterTextValue): YamlText[] {
  const yamlKey = formatYamlKey(key)
  const yamlValue = toYamlValue(value)
  return isNonEmptyList(value) ? [`${yamlKey}:`, yamlValue] : [`${yamlKey}: ${yamlValue}`]
}
