'use client'

import { useCallback, useEffect, useRef } from 'react'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { TRANSFORMERS, $convertToMarkdownString, $convertFromMarkdownString } from '@lexical/markdown'
import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import { CodeNode, CodeHighlightNode } from '@lexical/code'
import { ListNode, ListItemNode } from '@lexical/list'
import { LinkNode } from '@lexical/link'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import {
  FORMAT_TEXT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
  $getSelection,
  $isRangeSelection,
  type EditorState,
  type LexicalEditor,
} from 'lexical'
import { $setBlocksType } from '@lexical/selection'
import { $createHeadingNode, $createQuoteNode } from '@lexical/rich-text'
import { $createCodeNode } from '@lexical/code'
import {
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
} from '@lexical/list'
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Code2,
  Undo2,
  Redo2,
} from 'lucide-react'

// ── Toolbar ─────────────────────────────────────────────────────────────────
function Toolbar() {
  const [editor] = useLexicalComposerContext()

  const format = (type: 'bold' | 'italic' | 'strikethrough' | 'underline' | 'code') => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, type)
  }

  const setBlock = (type: 'h1' | 'h2' | 'quote' | 'code') => {
    editor.update(() => {
      const selection = $getSelection()
      if (!$isRangeSelection(selection)) return
      $setBlocksType(selection, () => {
        if (type === 'h1') return $createHeadingNode('h1')
        if (type === 'h2') return $createHeadingNode('h2')
        if (type === 'quote') return $createQuoteNode()
        return $createCodeNode()
      })
    })
  }

  const btn = 'rounded-lg p-1.5 text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-900'

  return (
    <div className="flex items-center gap-0.5 border-b-2 border-black px-2 py-1.5">
      <button onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)} className={btn} title="Undo">
        <Undo2 className="h-3.5 w-3.5" />
      </button>
      <button onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)} className={btn} title="Redo">
        <Redo2 className="h-3.5 w-3.5" />
      </button>
      <div className="mx-1 h-4 w-px bg-stone-200" />
      <button onClick={() => format('bold')} className={btn} title="Bold">
        <Bold className="h-3.5 w-3.5" />
      </button>
      <button onClick={() => format('italic')} className={btn} title="Italic">
        <Italic className="h-3.5 w-3.5" />
      </button>
      <button onClick={() => format('strikethrough')} className={`${btn} text-xs font-bold line-through`} title="Strikethrough">
        S
      </button>
      <div className="mx-1 h-4 w-px bg-stone-200" />
      <button onClick={() => setBlock('h1')} className={btn} title="Heading 1">
        <Heading1 className="h-3.5 w-3.5" />
      </button>
      <button onClick={() => setBlock('h2')} className={btn} title="Heading 2">
        <Heading2 className="h-3.5 w-3.5" />
      </button>
      <button onClick={() => setBlock('quote')} className={btn} title="Quote">
        <Quote className="h-3.5 w-3.5" />
      </button>
      <button onClick={() => setBlock('code')} className={btn} title="Code block">
        <Code2 className="h-3.5 w-3.5" />
      </button>
      <div className="mx-1 h-4 w-px bg-stone-200" />
      <button onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)} className={btn} title="Bullet list">
        <List className="h-3.5 w-3.5" />
      </button>
      <button onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)} className={btn} title="Numbered list">
        <ListOrdered className="h-3.5 w-3.5" />
      </button>
      <div className="ml-auto pl-2 text-[10px] text-stone-300">
        markdown shortcuts supported
      </div>
    </div>
  )
}

// ── Change handler with save status ─────────────────────────────────────────
function SavePlugin({
  onChange,
  onSaveStatus,
}: {
  onChange: (md: string) => void
  onSaveStatus: (status: 'saving' | 'saved') => void
}) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleChange = useCallback(
    (editorState: EditorState) => {
      editorState.read(() => {
        const md = $convertToMarkdownString(TRANSFORMERS)
        onChange(md)
        onSaveStatus('saving')
        if (timerRef.current) clearTimeout(timerRef.current)
        timerRef.current = setTimeout(() => onSaveStatus('saved'), 800)
      })
    },
    [onChange, onSaveStatus],
  )

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  return <OnChangePlugin onChange={handleChange} ignoreSelectionChange />
}

// ── Main NoteEditor ──────────────────────────────────────────────────────────
interface NoteEditorProps {
  videoId: string
  initialMarkdown: string
  onChange: (md: string) => void
  onSaveStatus?: (status: 'saving' | 'saved') => void
}

function editorStateFromMarkdown(markdown: string) {
  return (editor: LexicalEditor) => {
    editor.update(() => {
      $convertFromMarkdownString(markdown, TRANSFORMERS)
    })
  }
}

export function NoteEditor({ videoId, initialMarkdown, onChange, onSaveStatus }: NoteEditorProps) {
  const initialConfig = {
    namespace: `note-${videoId}`,
    nodes: [HeadingNode, QuoteNode, CodeNode, CodeHighlightNode, ListNode, ListItemNode, LinkNode],
    editorState: editorStateFromMarkdown(initialMarkdown),
    onError: (err: Error) => console.error(err),
    theme: {
      text: {
        bold: 'font-bold',
        italic: 'italic',
        strikethrough: 'line-through',
        underline: 'underline',
        code: 'rounded bg-stone-100 px-1 py-0.5 font-mono text-xs text-stone-700',
      },
      heading: {
        h1: 'text-lg font-bold text-stone-900 mb-1',
        h2: 'text-base font-bold text-stone-800 mb-1',
      },
      quote: 'border-l-4 border-stone-300 pl-3 italic text-stone-500 my-1',
      code: 'block rounded-lg bg-stone-100 p-3 font-mono text-xs text-stone-700 my-1 whitespace-pre-wrap',
      list: {
        ul: 'list-disc pl-5 my-1',
        ol: 'list-decimal pl-5 my-1',
        listitem: 'my-0.5',
      },
      paragraph: 'mb-1 text-sm text-stone-700 empty:min-h-[1.25rem]',
    },
  }

  return (
    // key=videoId forces full remount when switching videos → loads correct note
    <LexicalComposer key={videoId} initialConfig={initialConfig}>
      <Toolbar />
      <div className="relative">
        <RichTextPlugin
          contentEditable={
            <ContentEditable className="min-h-[120px] px-4 py-3 focus:outline-none" />
          }
          placeholder={
            <div className="pointer-events-none absolute left-4 top-3 text-sm text-stone-300">
              Add notes for this video… (supports **bold**, # headings, - lists, `code`)
            </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
      </div>
      <HistoryPlugin />
      <ListPlugin />
      <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
      <SavePlugin onChange={onChange} onSaveStatus={onSaveStatus ?? (() => {})} />
    </LexicalComposer>
  )
}
