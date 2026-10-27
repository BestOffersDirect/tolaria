import { useEffect, useRef, useState } from "react"
import {
  ArchiveIcon, ArrowLeftIcon, ArrowRightIcon, ArrowsClockwiseIcon, ArrowDownIcon, BookOpenIcon, CaretDownIcon, CaretRightIcon,
  CheckCircleIcon, ClockCounterClockwiseIcon, CodeIcon, DotsThreeIcon, FileTextIcon, FolderOpenIcon, GitBranchIcon, GitCommitIcon,
  HandHeartIcon, MagnifyingGlassIcon, PlusIcon, SidebarSimpleIcon, SlidersHorizontalIcon, StarIcon, TagIcon, TrayIcon, UsersIcon,
  WrenchIcon, CheckCircleIcon as DoneIcon, ColumnsIcon, ListBulletsIcon,
} from "@phosphor-icons/react"

// A live HTML recreation of Tolaria's main window in the LIGHT theme, with the Getting Started vault.
// Layout, note-list rows, sidebar sections and bottom bar are matched to Karn's 2026-10-26 captures
// (screens/2026-10-26-hybrid-main.png, -editor-wikilinks.png); light colours sampled from the May light capture
// and screens/2026-10-26-light-main.png (the fidelity reference): sidebar #f7f6f3, rules #e9e9e7, active row #dfe6f4,
// Project selection #fcebeb with a #e53e3e rule, text #37352f, muted #787774.
// Story (12s loop, motion.css .hw): the selection moves from "Get familiar with Tolaria" to "Editor", "Related: [[Tol"
// is typed (the row gets its unsaved dot), the wikilink picker opens and "Tolaria" is linked, then the bottom bar
// commits, pushes and shows "Synced just now".
const W = 1200, H = 690, ROW = 104
const C = { side: "#f7f6f3", rule: "#e9e9e7", ink: "#37352f", head: "#2f2d27", muted: "#787774", faint: "#9b9a97", active: "#dfe6f4", blue: "#2c5cf6" }

export function HeroWindow({ bare = false }: { bare?: boolean }) {
  const box = useRef<HTMLDivElement>(null)
  const [s, setS] = useState(1)
  const [compact, setCompact] = useState(false)
  useEffect(() => {
    const el = box.current!
    const ro = new ResizeObserver(([e]) => {
      const w = e.contentRect.width
      const c = w < 540
      setCompact(c)
      setS(w / (c ? 460 : W))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const dw = compact ? 460 : W, dh = compact ? 440 : H
  return (
    <div ref={box} className="w-full" style={{ height: dh * s }}>
      <div
        role="img"
        aria-label="Illustration of Tolaria's window in the light theme: the sidebar with types and folders, the note list, and the Editor note with the wikilink picker open"
        className={`hw loop origin-top-left overflow-hidden bg-white text-left text-[13px] leading-5 ${bare ? "" : "rounded-2xl border border-black/10 shadow-2xl shadow-blue-950/30"}`}
        style={{ width: dw, height: dh, transform: `scale(${s})`, color: C.ink, ["--row" as string]: `${ROW}px` }}
      >
        <div className="flex h-full flex-col" aria-hidden>
          <div className="flex min-h-0 flex-1">
            {!compact && <Sidebar />}
            {!compact && <NoteList />}
            <div className="flex min-w-0 flex-1 flex-col">
              <EditorTop compact={compact} />
              <Editor compact={compact} />
            </div>
          </div>
          <BottomBar compact={compact} />
        </div>
      </div>
    </div>
  )
}

function Sidebar() {
  return (
    <div className="flex w-[214px] shrink-0 flex-col" style={{ background: C.side, borderRight: `1px solid ${C.rule}` }}>
      <div className="flex h-11 shrink-0 items-center gap-2 px-3.5">
        <span className="size-3 rounded-full bg-[#ff5f57]" /><span className="size-3 rounded-full bg-[#febc2e]" /><span className="size-3 rounded-full bg-[#28c840]" />
        <span className="ml-4 flex items-center gap-3" style={{ color: C.faint }}><SidebarSimpleIcon className="size-4" /><ArrowLeftIcon className="size-4" /><ArrowRightIcon className="size-4" /></span>
      </div>
      <div className="flex flex-col gap-px px-1.5 pt-1 pb-2" style={{ borderTop: `1px solid ${C.rule}` }}>
        <Row icon={TrayIcon} label="Inbox" n={20} />
        <Row icon={FileTextIcon} label="All Notes" n={25} active />
        <Row icon={ArchiveIcon} label="Archive" />
      </div>
      <Head label="Views" open={false} />
      <Head label="Types" sliders />
      <div className="flex flex-col gap-px px-1.5 pb-2">
        <Row icon={FileTextIcon} label="notes" color="#2fa36b" />
        <Row icon={UsersIcon} label="People" n={1} color="#d9a21b" />
        <Row icon={WrenchIcon} label="Projects" n={2} color="#e53e3e" />
        <Row icon={TagIcon} label="Topics" n={1} color="#2fa36b" />
        <Row icon={FileTextIcon} label="types" color={C.ink} />
      </div>
      <Head label="Folders" />
      <div className="px-1.5"><Row icon={FolderOpenIcon} label="Getting Started" color={C.ink} fill /></div>
    </div>
  )
}
function Head({ label, open = true, sliders }: { label: string; open?: boolean; sliders?: boolean }) {
  const Car = open ? CaretDownIcon : CaretRightIcon
  return (
    <div className="flex h-9 shrink-0 items-center gap-1.5 px-3.5 text-[11px] font-semibold tracking-[0.06em] uppercase" style={{ color: C.faint, borderTop: `1px solid ${C.rule}` }}>
      <Car weight="bold" className="size-3" />{label}
      <span className="ml-auto flex items-center gap-2.5">{sliders && <SlidersHorizontalIcon className="size-3.5" />}<PlusIcon className="size-3.5" /></span>
    </div>
  )
}
function Row({ icon: I, label, n, active, color, fill }: { icon: typeof FileTextIcon; label: string; n?: number; active?: boolean; color?: string; fill?: boolean }) {
  return (
    <div className="flex h-[30px] items-center gap-2.5 rounded-md px-2 text-[13.5px]" style={active ? { background: C.active, color: C.blue, fontWeight: 500 } : undefined}>
      <I weight={active || fill ? "fill" : "regular"} className="size-[17px] shrink-0" style={{ color: active ? C.blue : color ?? C.ink }} />
      <span className="flex-1 truncate">{label}</span>
      {n !== undefined && (
        <span className="min-w-6 rounded-full px-1.5 text-center text-[11px] leading-[18px] font-medium" style={active ? { background: C.blue, color: "#fff" } : { background: "#ebeae7", color: C.muted }}>{n}</span>
      )}
    </div>
  )
}

const NOTES: [string, string, string, ("project" | "note")][] = [
  ["AI in Tolaria", "Tolaria embraces AI without making it a requirement. Choose between coding agents...", "October 26, 2026", "note"],
  ["Editor", "The editor is where you write and edit your notes. Tolaria supports two modes: The...", "October 26, 2026", "note"],
  ["Get familiar with Tolaria", "Use this checklist as a 15–20 minute tour of Tolaria. Every link opens a real file you can...", "October 26, 2026", "project"],
  ["Git and AutoGit", "Tolaria vaults have first-class, optional Git support. You retain control over when to...", "October 26, 2026", "note"],
  ["Project Dashboard", "The block below is stored as fenced HTML inside this Markdown note. Tolaria renders it...", "October 25, 2026", "project"],
  ["Principles", "Tolaria is built on a few core principles that guide our design decisions: Your notes are...", "October 25, 2026", "note"],
  ["Make It Yours", "A few settings change how Tolaria looks and feels. Open Settings with Cmd+, or Ctrl+,...", "October 25, 2026", "note"],
]
function NoteList() {
  return (
    <div className="flex w-[276px] shrink-0 flex-col bg-white" style={{ borderRight: `1px solid ${C.rule}` }}>
      <div className="flex h-11 shrink-0 items-center gap-2.5 px-4" style={{ borderBottom: `1px solid ${C.rule}` }}>
        <span className="flex-1 text-[15px] font-semibold" style={{ color: C.head }}>Notes</span>
        <span className="flex items-center gap-0.5 text-[11.5px]" style={{ color: C.muted }}><ArrowDownIcon className="size-3" />Modified</span>
        <span className="flex items-center gap-2.5" style={{ color: C.muted }}><MagnifyingGlassIcon className="size-4" /><SlidersHorizontalIcon className="size-4" /><PlusIcon className="size-4" /></span>
      </div>
      <div className="relative flex-1 overflow-hidden">
        {/* selection: starts on "Get familiar" (row 3, Project tint), moves up to "Editor" (row 2, neutral tint) */}
        <div className="sel absolute inset-x-0" style={{ top: ROW, height: ROW }}>
          <div className="sel-b absolute inset-0 border-l-[3px] border-[#b4b3b0] bg-[#f0f0ef]" />
          <div className="sel-a absolute inset-0 border-l-[3px] border-[#e53e3e] bg-[#fcebeb]" />
        </div>
        {NOTES.map(([t, b, d, k]) => (
          <div key={t} className="relative flex flex-col px-4 pt-3" style={{ height: ROW, borderBottom: `1px solid ${C.rule}` }}>
            <div className="flex items-center gap-1.5">
              {t === "Editor" && <span className="mod-dot absolute top-[19px] left-[7px] size-1.5 rounded-full bg-[#2fa36b]" />}
              <span className="flex-1 truncate text-[13.5px] leading-5 font-semibold" style={{ color: C.head }}>{t}</span>
              {k === "project" ? <WrenchIcon className="size-3.5 shrink-0 text-[#e53e3e]" /> : <FileTextIcon className="size-3.5 shrink-0" style={{ color: C.faint }} />}
            </div>
            <div className="mt-1.5 line-clamp-2 text-[12px] leading-4" style={{ color: C.muted }}>{b}</div>
            <div className="mt-auto mb-2.5 flex justify-between text-[10.5px] leading-4" style={{ color: C.faint }}><span>{d}</span><span>Created {d}</span></div>
          </div>
        ))}
      </div>
    </div>
  )
}

function EditorTop({ compact }: { compact: boolean }) {
  const icons = compact ? [StarIcon, CodeIcon, ClockCounterClockwiseIcon] : [StarIcon, DoneIcon, BookOpenIcon, CodeIcon, ColumnsIcon, ListBulletsIcon, FolderOpenIcon, DotsThreeIcon]
  return (
    <div className="flex h-11 shrink-0 items-center gap-1.5 px-5 text-[12.5px]" style={{ borderBottom: `1px solid ${C.rule}` }}>
      <span className="relative inline-flex h-5 items-center">
        <span className="crumb-b flex items-center gap-1.5"><span style={{ color: C.muted }}>Note</span><CaretRightIcon className="size-3" style={{ color: C.faint }} /><span className="font-medium" style={{ color: C.head }}>tolaria-editor</span></span>
        <span className="crumb-a absolute inset-y-0 left-0 flex items-center gap-1.5 whitespace-nowrap bg-white"><span style={{ color: C.muted }}>Project</span><CaretRightIcon className="size-3" style={{ color: C.faint }} /><span className="font-medium" style={{ color: C.head }}>get-familiar-with-tolaria</span></span>
      </span>
      <span className="ml-auto flex items-center gap-3.5" style={{ color: C.muted }}>{icons.map((I, i) => <I key={i} className="size-4" />)}</span>
    </div>
  )
}

const PICK: [string, string][] = [["Tolaria", "Topic"], ["AI in Tolaria", "Note"], ["Principles", "Note"], ["Editor", "Note"], ["Note List", "Note"]]
function Editor({ compact }: { compact: boolean }) {
  return (
    <div className={`relative flex-1 overflow-hidden pt-12 ${compact ? "px-7" : "px-[84px]"}`}>
      <div className="ed-b">
      <div className="text-[34px] leading-10 font-bold tracking-[-0.01em]" style={{ color: C.head }}>Editor</div>
      <div className="mt-4 h-px" style={{ background: C.rule }} />
      <p className="mt-4 text-[15px] leading-6">The editor is where you write and edit your notes. Tolaria supports two modes:</p>
      <div className="relative mt-3 text-[15px] leading-6">
        <span className="line inline-flex items-baseline whitespace-nowrap">
          <span className="typed shrink-0" style={{ ["--mask" as string]: "#fff" }}>
            Related: [[Tol
            <span className="mask" /><span className="track"><span className="caret-wrap absolute inset-y-0 right-0 w-0"><span className="caret" /></span></span>
          </span>
        </span>
        <span className="link absolute top-0 left-0 whitespace-nowrap">Related: <span className="rounded px-0.5 underline decoration-[#2c5cf6]/40 underline-offset-4" style={{ color: C.blue }}>Tolaria</span></span>
        <div className="pop absolute top-8 left-[56px] z-10 w-[270px] overflow-hidden rounded-lg border bg-white py-1 shadow-xl" style={{ borderColor: C.rule }}>
          {(compact ? PICK.slice(0, 4) : PICK).map(([t, k], i) => (
            <div key={t} className="relative flex h-8 items-center gap-2 px-3 text-[13px]" style={i === 0 ? { background: "#f1f4fd" } : undefined}>
              {i === 0 && <span className="absolute inset-y-0 left-0 w-[3px]" style={{ background: C.blue }} />}
              {k === "Topic" ? <TagIcon className="size-4" style={{ color: C.muted }} /> : <FileTextIcon className="size-4" style={{ color: C.muted }} />}
              <span className="flex-1 truncate">{t}</span>
              <span className="rounded-full px-2 text-[11px] leading-[18px]" style={k === "Topic" ? { background: "#e6f4ec", color: "#1f7a4d" } : { background: "#efefed", color: C.muted }}>{k}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-7 text-[21px] leading-7 font-bold" style={{ color: C.head }}>WYSIWYG mode</div>
      <p className="mt-2 text-[15px] leading-6">The default mode. You type naturally and see formatted output.</p>
      {!compact && (
        <>
          <div className="mt-3 border-l-[3px] pl-3.5 text-[15px] leading-6" style={{ borderColor: C.blue, color: C.muted }}>Quote from a wise author</div>
          <div className="mt-3 flex flex-col gap-2 text-[15px] leading-6">
            {["Task 1", "Task 2"].map((t) => <div key={t} className="flex items-center gap-2.5"><span className="size-4 rounded border" style={{ borderColor: "#c9c8c5" }} />{t}</div>)}
          </div>
        </>
      )}
      </div>
      <div className={`ed-a absolute inset-0 bg-white pt-12 ${compact ? "px-7" : "px-[84px]"}`}>
        <div className="text-[34px] leading-10 font-bold tracking-[-0.01em]" style={{ color: C.head }}>Get familiar with Tolaria</div>
        <div className="mt-4 h-px" style={{ background: C.rule }} />
        <p className="mt-4 text-[15px] leading-6">Use this checklist as a 15–20 minute tour of Tolaria. Every link opens a real file you can inspect, edit, and restore with Git.</p>
        <p className="mt-2 text-[15px] leading-6"><code className="rounded bg-[#efefed] px-1.5 py-0.5 font-mono text-[13px]">Cmd+click</code> on wikilinks to navigate</p>
        <div className="mt-3 flex flex-col gap-2.5 text-[14.5px] leading-6">
          {([["Read the", "Tolaria Principles", "understand the core philosophy"], ["Explore the", "Sidebar", "learn Inbox, All Notes, Archive, Favorites, Types, Folders"], ["Browse the", "Note List", "sorting, display properties, search within list"], ["Open the", "Project Dashboard", "see a Markdown note render its own properties"]] as const).map(([a, l, b]) => (
            <div key={l} className="flex items-start gap-2.5"><span className="mt-1 size-4 shrink-0 rounded border" style={{ borderColor: "#c9c8c5" }} /><span><b className="font-semibold">{a}</b> <span className="underline decoration-dashed decoration-1 underline-offset-4" style={{ color: l === "Project Dashboard" ? "#e53e3e" : C.muted }}>{l}</span> — {b}</span></div>
          ))}
        </div>
      </div>
    </div>
  )
}

function BottomBar({ compact }: { compact: boolean }) {
  return (
    <div className="flex h-8 shrink-0 items-center gap-4 px-3.5 text-[12px] whitespace-nowrap" style={{ background: C.side, borderTop: `1px solid ${C.rule}`, color: C.muted }}>
      {!compact && <><span className="flex items-center gap-1.5"><FolderOpenIcon className="size-3.5" />Getting Started</span><span>2026.10.26</span></>}
      <span className="flex items-center gap-1"><GitBranchIcon className="size-3.5" />main</span>
      <span className="commit-btn inline-flex items-center gap-1 rounded-md"><GitCommitIcon className="size-3.5" />Commit</span>
      <span className="relative inline-flex h-5 w-[130px] items-center">
        <span className="s1 absolute inset-0 flex items-center gap-1.5"><span className="flex size-4 items-center justify-center rounded-full bg-[#f76b15] text-[10px] font-semibold text-white">1</span>change</span>
        <span className="s2 absolute inset-0 flex items-center gap-1.5"><ArrowsClockwiseIcon className="size-3.5" style={{ color: C.blue }} />Pushing</span>
        <span className="s3 absolute inset-0 flex items-center gap-1.5"><CheckCircleIcon weight="fill" className="dot-pulse size-3.5 text-[#2fa36b]" />Synced just now</span>
      </span>
      {!compact && <span className="flex items-center gap-1"><ClockCounterClockwiseIcon className="size-3.5" />History</span>}
      <span className="ml-auto flex items-center gap-4">{!compact && <span className="flex items-center gap-1"><HandHeartIcon className="size-3.5" />Contribute</span>}<span className="flex items-center gap-1"><BookOpenIcon className="size-3.5" />Docs</span></span>
    </div>
  )
}

// MacBook-style frame: black screen bezel with the camera notch, then the aluminium base with its hinge lip and
// thumb notch. The screen holds the live window recreation edge to edge (a full-screen Tolaria window).
export function MacBook({ className = "" }: { className?: string }) {
  return (
    <div className={className}>
      <div className="relative mx-auto w-[88%] rounded-t-[18px] rounded-b-[6px] bg-[#0c0c0e] p-[1.6%] pb-[2.2%] shadow-[0_30px_60px_-20px_rgba(10,30,80,0.45)] ring-1 ring-black/40">
        <div aria-hidden className="absolute top-0 left-1/2 z-10 flex h-[2.6%] min-h-3 w-[13%] -translate-x-1/2 items-center justify-center rounded-b-[8px] bg-[#0c0c0e]">
          <span className="size-1.5 rounded-full bg-[#1d2430] ring-1 ring-[#2a3342]" />
        </div>
        <div className="overflow-hidden rounded-[6px] bg-white">
          <HeroWindow bare />
        </div>
      </div>
      <div aria-hidden className="relative h-[clamp(10px,1.6vw,18px)] rounded-b-[14px] rounded-t-[3px] bg-[#cfd1d4] shadow-[0_24px_40px_-12px_rgba(10,30,80,0.35)]">
        <div className="absolute inset-x-0 top-0 h-[38%] rounded-t-[3px] bg-[#e4e5e7]" />
        <div className="absolute top-0 left-1/2 h-[42%] w-[14%] -translate-x-1/2 rounded-b-[8px] bg-[#b9bbbf]" />
        <div className="absolute inset-x-[1.5%] bottom-0 h-[22%] rounded-b-[14px] bg-[#b4b6ba]" />
      </div>
    </div>
  )
}
