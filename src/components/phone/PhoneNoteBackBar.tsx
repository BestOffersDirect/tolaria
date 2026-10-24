import { CaretLeft } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import type { PhoneNoteStack } from '../../hooks/usePhoneNoteStack'
import { translate, type AppLocale } from '../../lib/i18n'

interface PhoneNoteBackBarProps {
  locale: AppLocale
  stack: PhoneNoteStack
}

/** The phone layout's way back from a note to the note list (TOL-193); absent elsewhere. */
export function PhoneNoteBackBar({ locale, stack }: PhoneNoteBackBarProps) {
  if (!stack.active) return null
  return (
    <div className="app__phone-back-bar">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={stack.backToList}
        aria-label={translate(locale, 'phone.action.backToNotes')}
        data-testid="phone-back-to-notes"
      >
        <CaretLeft size={16} weight="regular" />
        {translate(locale, 'phone.action.notes')}
      </Button>
    </div>
  )
}
