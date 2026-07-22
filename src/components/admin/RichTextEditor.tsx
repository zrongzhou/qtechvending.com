'use client';

import { useEffect, useRef } from 'react';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { Markdown } from 'tiptap-markdown';

export interface RichTextEditorProps {
  /** Initial content as a Markdown string (the editor serialises back to Markdown). */
  value: string;
  /** Called with the current Markdown string whenever the content changes. */
  onChange: (md: string) => void;
  placeholder?: string;
  /** Optional extra classes for the editing surface. */
  className?: string;
}

const btnCls =
  'inline-flex h-8 min-w-8 items-center justify-center rounded-md border border-slate-200 bg-white px-2 text-sm text-slate-700 transition-colors hover:bg-slate-100';
const btnActiveCls = 'bg-brand-600 text-white border-brand-600 hover:bg-brand-700';

function ToolbarButton({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={active}
      // Prevent the editor from losing selection when clicking the toolbar.
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`${btnCls} ${active ? btnActiveCls : ''}`}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const setLink = () => {
    const prev = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('链接地址 (URL)', prev ?? 'https://');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const setImage = () => {
    const url = window.prompt('图片地址 (URL)', 'https://');
    if (!url) return;
    editor.chain().focus().setImage({ src: url }).run();
  };

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 px-2 py-1.5">
      <ToolbarButton title="加粗" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
        <span className="font-bold">B</span>
      </ToolbarButton>
      <ToolbarButton title="斜体" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <span className="italic">I</span>
      </ToolbarButton>
      <span className="mx-1 h-5 w-px bg-slate-200" />
      <ToolbarButton title="标题 H1" active={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
        H1
      </ToolbarButton>
      <ToolbarButton title="标题 H2" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
        H2
      </ToolbarButton>
      <ToolbarButton title="标题 H3" active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
        H3
      </ToolbarButton>
      <span className="mx-1 h-5 w-px bg-slate-200" />
      <ToolbarButton title="无序列表" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        •&nbsp;≡
      </ToolbarButton>
      <ToolbarButton title="有序列表" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        1.&nbsp;≡
      </ToolbarButton>
      <ToolbarButton title="引用" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        ❝
      </ToolbarButton>
      <ToolbarButton title="代码块" active={editor.isActive('codeBlock')} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
        {'</>'}
      </ToolbarButton>
      <span className="mx-1 h-5 w-px bg-slate-200" />
      <ToolbarButton title="链接" active={editor.isActive('link')} onClick={setLink}>
        🔗
      </ToolbarButton>
      <ToolbarButton title="图片" active={editor.isActive('image')} onClick={setImage}>
        🖼
      </ToolbarButton>
    </div>
  );
}

/**
 * Controlled WYSIWYG editor backed by tiptap. The value is a Markdown string and
 * all output is serialised back to Markdown via `tiptap-markdown`, keeping full
 * compatibility with the existing blog content (which is stored as Markdown).
 */
export default function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
  const lastEmitted = useRef<string | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Link.configure({ openOnClick: false, autolink: true, HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' } }),
      Image.configure({ inline: false, allowBase64: false }),
      Placeholder.configure({ placeholder: placeholder || '' }),
      // tiptap-markdown: parses Markdown input and serialises via
      // editor.storage.markdown.getMarkdown().
      Markdown.configure({
        html: false,
        transformPastedText: true,
        transformCopiedText: true,
      }),
    ],
    content: value || '',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none px-3 py-2 text-sm text-ink-800',
      },
    },
    onUpdate: ({ editor }) => {
      const md = editor.storage.markdown.getMarkdown();
      lastEmitted.current = md;
      onChange(md);
    },
  });

  // Sync external value changes (e.g. loading an existing post, or form reset)
  // without disturbing the caret during normal typing.
  useEffect(() => {
    if (!editor) return;
    if (value === lastEmitted.current) return;
    const current = editor.storage.markdown.getMarkdown();
    if (value !== current) {
      editor.commands.setContent(value || '', false);
      lastEmitted.current = value;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  if (!editor) {
    return (
      <div className={`min-h-[180px] rounded-b-lg border border-t-0 border-slate-200 bg-white ${className ?? ''}`} />
    );
  }

  return (
    <div className={`overflow-hidden rounded-lg border border-slate-300 ${className ?? ''}`}>
      <Toolbar editor={editor} />
      <EditorContent editor={editor} className="min-h-[180px]" />
    </div>
  );
}
