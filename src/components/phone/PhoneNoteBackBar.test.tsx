import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { PhoneNoteStack } from '../../hooks/usePhoneNoteStack'
import { PhoneNoteBackBar } from './PhoneNoteBackBar'

function stack(active: boolean): PhoneNoteStack {
  return { active, pane: 'note', showingNote: (open) => open, backToList: vi.fn() }
}

describe('PhoneNoteBackBar', () => {
  it('goes back to the note list on the phone layout', () => {
    const phone = stack(true)
    render(<PhoneNoteBackBar locale="en" stack={phone} />)

    fireEvent.click(screen.getByRole('button', { name: 'Back to notes' }))

    expect(phone.backToList).toHaveBeenCalled()
    expect(screen.getByText('Notes')).toBeTruthy()
  })

  it('renders nothing off the phone layout', () => {
    const { container } = render(<PhoneNoteBackBar locale="en" stack={stack(false)} />)
    expect(container.innerHTML).toBe('')
  })
})
