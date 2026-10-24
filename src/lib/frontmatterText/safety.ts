import { UnsafeFrontmatterEditError } from './unsafeText'
import { type FrontmatterTextValue, formatYamlField, formatYamlKey } from './yaml'

export { UnsafeFrontmatterEditError } from './unsafeText'

/**
 * Throws `UnsafeFrontmatterEditError` for an edit the frontmatter writer would refuse: the
 * same check `updateFrontmatterContent` makes, for callers that check before any I/O. An
 * empty key is refused too: `: value` is not a property.
 */
export function assertSafeFrontmatterEdit(key: string, value: FrontmatterTextValue | undefined): void {
  if (key === '') throw new UnsafeFrontmatterEditError()
  if (value === undefined) formatYamlKey(key)
  else formatYamlField(key, value)
}
