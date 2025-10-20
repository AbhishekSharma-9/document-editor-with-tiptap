"use client";
import { cn } from "@/lib/utils";
import Blockquote from "@tiptap/extension-blockquote";
import Code from "@tiptap/extension-code";
import CodeBlock from "@tiptap/extension-code-block";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import { Table } from "@tiptap/extension-table";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableRow } from "@tiptap/extension-table-row";
import { TextAlign } from "@tiptap/extension-text-align";
import { FontSize, TextStyle } from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useState } from "react";
import { A4PageLayout } from "./a4-page-layout";
import { ImageResize } from "./image-extension";
import { MultiPageEditor } from "./multi-page-editor";
import { PageBreak } from "./page-break-extension";
import { PageManagerProvider } from "./page-manager";
import { StatusBar } from "./status-bar";
import {
  FontFamilyExtension,
  IndentExtension,
  LineHeightExtension,
} from "./tiptap-extensions";
import { EditorToolbar } from "./toolbar";
import { useImageUpload } from "./use-image-upload";

export function RichEditor() {
  const [isPageLayout, setIsPageLayout] = useState(false);
  const [isMultiPageMode, setIsMultiPageMode] = useState(false);
  // page margin in pixels (applies as padding inside page container)
  const [pageMargin, setPageMargin] = useState<number>(64); // default: 64px (p-16)

  const togglePageLayout = () => {
    setIsPageLayout(!isPageLayout);
  };

  const toggleMultiPageMode = () => {
    setIsMultiPageMode(!isMultiPageMode);
  };

  const editor = useEditor({
    extensions: [
      // Base kit: paragraphs, headings, bold, italic, lists, etc.
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
        bulletList: {
          keepMarks: true,
          keepAttributes: true,
          HTMLAttributes: {
            class: "list-disc list-inside",
          },
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: true,
          HTMLAttributes: {
            class: "list-decimal list-inside",
          },
        },
        listItem: {
          HTMLAttributes: {
            class: "ml-4",
          },
        },
        codeBlock: false, // We'll use the standalone CodeBlock extension
      }),
      // Marks and styles
      Underline,
      TextStyle,
      Color, // text color via TextStyle
      Highlight.configure({ multicolor: true }), // background color
      Superscript,
      Subscript,
      // Custom attributes
      IndentExtension,
      LineHeightExtension,
      FontFamilyExtension,
      FontSize.configure({
        types: ["textStyle"],
      }),
      // Text alignment
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      // Content blocks
      Blockquote,
      CodeBlock,
      Code,
      // Links
      Link.extend({
        inclusive: false, // This ensures cursor moves outside link after insertion
      }).configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 underline cursor-pointer hover:text-blue-800",
        },
      }),
      // Tables
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      // Images
      ImageResize.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-lg shadow-sm",
        },
      }),
      // Custom attributes
      IndentExtension,
      LineHeightExtension,

      // Page break
      PageBreak,
    ],
    // Prevent immediate DOM rendering on initial (server) render to avoid hydration mismatch
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          // Keep styles semantic and token-based
          cn(
            "w-full h-full min-h-[600px] rounded-lg bg-white text-gray-900 focus:outline-none",
            "prose prose-lg max-w-none prose-headings:font-bold",
            "prose-p:leading-relaxed prose-headings:leading-tight"
            // If the project doesn't include Typography plugin, this still renders fine
          ),
      },
    },
    content: `<h1>Welcome</h1><p>Start typing…</p>`,
  });

  // Image upload functionality
  const { handleDrop, handleDragOver, handleDragLeave, handlePaste } =
    useImageUpload(editor);

  return (
    <div className="flex flex-col">
      <div className="sticky top-0 z-40 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <EditorToolbar
          editor={editor}
          isPageLayout={isPageLayout}
          onTogglePageLayout={togglePageLayout}
          isMultiPageMode={isMultiPageMode}
          onToggleMultiPageMode={toggleMultiPageMode}
          pageMargin={pageMargin}
          onChangePageMargin={(m: number) => setPageMargin(m)}
        />
      </div>
      {isMultiPageMode ? (
        <PageManagerProvider editor={editor}>
          <MultiPageEditor
            editor={editor}
            pageMargin={pageMargin}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onPaste={handlePaste}
          />
        </PageManagerProvider>
      ) : isPageLayout ? (
        <A4PageLayout pageMargin={pageMargin}>
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onPaste={handlePaste}
          >
            <EditorContent editor={editor} />
          </div>
        </A4PageLayout>
      ) : (
        <div
          className="w-full h-full mx-auto bg-white"
          style={{ padding: `${pageMargin}px` }}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onPaste={handlePaste}
        >
          <EditorContent editor={editor} />
        </div>
      )}
      {/* Status bar */}
      <StatusBar editor={editor} />

      {/* Help text */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-8 py-4">
        <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
          💡 <strong>Pro Tips:</strong> Use Ctrl/Cmd + B/I/U for quick
          formatting • Ctrl/Cmd + S to save • Right-click for context menu • Use
          Tab/Shift+Tab for indentation • Insert tables, blockquotes, code
          blocks, and links • Create multilevel nested lists with proper
          indentation • Drag & drop images or use the image button to upload •
          Click images to resize with corner handles or remove them
        </p>
      </div>
    </div>
  );
}
