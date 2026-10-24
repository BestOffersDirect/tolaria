import { useCallback, useEffect, useRef, useState } from 'react'
import type { VaultEntry } from '../types'
import type { WebRoute } from '../utils/webRoute'
import { useKeyboardAwareViewport } from './useKeyboardAwareViewport'
import { usePhoneLayout } from './usePhoneLayout'

/** Set on a history entry pushed while leaving the note list (useWebRouting). */
export const BACK_TO_NOTE_LIST_STATE_KEY = 'tolariaBackToNoteList'

export type PhonePane = 'list' | 'note'
type NoteOpener = (entry: VaultEntry) => unknown

/** The phone web layout (TOL-193): the note list, then the note, one pane at a time. */
export interface PhoneNoteStack {
  active: boolean
  pane: PhonePane
  /** Wraps the list's opener so a tapped note is shown, the already open one included. */
  showingNote: (open: NoteOpener) => NoteOpener
  /** The in-app back control. */
  backToList: () => void
}

/** What useWebRouting needs: the URL names no note while the phone shows the list. */
export interface NoteListPane {
  shown: boolean
  show: (shown: boolean) => void
}

interface PhoneNoteStackOptions {
  activeNotePath: string | null
  enabled: boolean
  initialRoute: WebRoute | null
  /** The last open note was restored: from here an opened note is shown. */
  ready: boolean
}

function enteredFromNoteList(): boolean {
  const state: unknown = window.history.state
  return typeof state === 'object' && state !== null && (state as Record<string, unknown>)[BACK_TO_NOTE_LIST_STATE_KEY] === true
}

/** A note opened after startup (list, wikilink, search, back/forward) takes the screen. */
function useShowOpenedNote(activeNotePath: string | null, ready: boolean, showNote: () => void): void {
  const seenPathRef = useRef<string | null | undefined>(undefined)
  useEffect(() => {
    if (!ready) return
    const seenPath = seenPathRef.current
    seenPathRef.current = activeNotePath
    if (seenPath !== undefined && activeNotePath && seenPath !== activeNotePath) showNote()
  }, [activeNotePath, ready, showNote])
}

/** Back on the list, the hidden editor lets go of focus, so the phone keyboard closes. */
function useBlurHiddenEditor(listShown: boolean): void {
  useEffect(() => {
    if (!listShown) return
    const focused = document.activeElement
    if (focused instanceof HTMLElement && focused.closest('.app__editor')) focused.blur()
  }, [listShown])
}

/**
 * One stable wrapper per opener, so the list's props keep their identity across renders.
 * Off the phone layout the opener is passed through untouched.
 */
function useShowingNote(active: boolean, showNote: () => void): PhoneNoteStack['showingNote'] {
  const wrappersRef = useRef(new WeakMap<NoteOpener, NoteOpener>())
  return useCallback((open: NoteOpener) => {
    if (!active) return open
    const cached = wrappersRef.current.get(open)
    if (cached) return cached
    const wrapped: NoteOpener = async (entry) => {
      await open(entry)
      showNote()
    }
    wrappersRef.current.set(open, wrapped)
    return wrapped
  }, [active, showNote])
}

/**
 * Phone-width web layout: the list comes first, unless the opening URL names a note. The
 * restored last note stays open behind the list so tapping it is instant. Back, in the app or
 * the browser, returns to the list through the history entry the list pushed.
 */
export function usePhoneNoteStack({ activeNotePath, enabled, initialRoute, ready }: PhoneNoteStackOptions): {
  noteListPane: NoteListPane | undefined
  stack: PhoneNoteStack
} {
  const active = usePhoneLayout(enabled)
  const [listShown, setListShown] = useState(() => !initialRoute?.note)
  const showNote = useCallback(() => { setListShown(false) }, [])
  useShowOpenedNote(activeNotePath, enabled && ready, showNote)
  useKeyboardAwareViewport(active)

  const showingNote = useShowingNote(active, showNote)
  const backToList = useCallback(() => {
    if (enteredFromNoteList()) window.history.back()
    else setListShown(true)
  }, [])

  const shown = listShown || !activeNotePath
  useBlurHiddenEditor(active && shown)
  return {
    noteListPane: active ? { shown, show: setListShown } : undefined,
    stack: { active, pane: shown ? 'list' : 'note', showingNote, backToList },
  }
}
