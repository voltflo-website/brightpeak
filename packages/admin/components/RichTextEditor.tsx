"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import { useEffect, useRef } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  variant?: "page" | "sidebar";
}

function MenuBar({ editor }: { editor: ReturnType<typeof useEditor> }) {
  if (!editor) return null;

  const btn = (
    label: string,
    action: () => void,
    isActive: boolean
  ) => (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault();
        action();
      }}
      className={`rte-btn${isActive ? " rte-btn-active" : ""}`}
      title={label}
    >
      {label}
    </button>
  );

  const setLink = () => {
    const prev = editor.getAttributes("link").href;
    const url = window.prompt("URL", prev || "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className="rte-toolbar">
      {btn("B", () => editor.chain().focus().toggleBold().run(), editor.isActive("bold"))}
      {btn("I", () => editor.chain().focus().toggleItalic().run(), editor.isActive("italic"))}
      {btn("U", () => editor.chain().focus().toggleUnderline().run(), editor.isActive("underline"))}
      <span className="rte-sep" />
      {btn("H2", () => editor.chain().focus().toggleHeading({ level: 2 }).run(), editor.isActive("heading", { level: 2 }))}
      {btn("H3", () => editor.chain().focus().toggleHeading({ level: 3 }).run(), editor.isActive("heading", { level: 3 }))}
      {btn("H4", () => editor.chain().focus().toggleHeading({ level: 4 }).run(), editor.isActive("heading", { level: 4 }))}
      <span className="rte-sep" />
      {btn("• List", () => editor.chain().focus().toggleBulletList().run(), editor.isActive("bulletList"))}
      {btn("1. List", () => editor.chain().focus().toggleOrderedList().run(), editor.isActive("orderedList"))}
      <span className="rte-sep" />
      {btn("Link", setLink, editor.isActive("link"))}
      {btn("Unlink", () => editor.chain().focus().unsetLink().run(), false)}
    </div>
  );
}

export default function RichTextEditor({ value, onChange, variant = "page" }: RichTextEditorProps) {
  const skipUpdate = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { target: "_blank", rel: "noopener noreferrer" },
      }),
      Underline,
    ],
    content: value || "",
    immediatelyRender: false,
    onUpdate: ({ editor: ed }) => {
      skipUpdate.current = true;
      const html = ed.getHTML();
      onChange(html === "<p></p>" ? "" : html);
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (skipUpdate.current) {
      skipUpdate.current = false;
      return;
    }
    const current = editor.getHTML();
    if (current !== value && !(current === "<p></p>" && !value)) {
      editor.commands.setContent(value || "");
    }
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div className={variant === "sidebar" ? "rte-wrap rte-sidebar" : "rte-wrap"}>
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
