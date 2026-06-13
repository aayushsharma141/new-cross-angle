import React from 'react';
import { useEffect } from "react";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { createLowlight } from 'lowlight';
import { Button } from "@/components/ui/primitives/button";
import { MediaPicker } from "@/components/admin/media/MediaPicker";
import {
    Bold, Italic, Strikethrough, Underline as UnderlineIcon,
    Heading1, Heading2, Heading3,
    List, ListOrdered, Quote,
    Undo, Redo, Link as LinkIcon, Image as ImageIcon,
    AlignLeft, AlignCenter, AlignRight,
    Minus, Code2, SeparatorHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";

const lowlight = createLowlight();

interface RichTextEditorProps {
    content: string;
    onChange: (content: string) => void;
    placeholder?: string;
    className?: string;
}

export function RichTextEditor({
    content,
    onChange,
    placeholder = "Write your story…",
    className,
}: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                // Disable StarterKit's built-in codeBlock so CodeBlockLowlight takes over
                codeBlock: false,
            }),
            Image.configure({
                inline: true,
                allowBase64: true,
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: '-admin-primary underline',
                },
            }),
            Placeholder.configure({
                placeholder,
            }),
            Underline,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            HorizontalRule,
            CodeBlockLowlight.configure({
                lowlight,
            }),
        ],
        content,
        editorProps: {
            attributes: {
                class: cn(
                    "prose prose-sm sm:prose-base dark:prose-invert max-w-none focus:outline-none min-h-[300px] p-4",
                    className
                ),
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    // Sync external content changes (e.g. loading a saved post) without
    // disturbing the user while they are actively typing.
    useEffect(() => {
        if (!editor || editor.isDestroyed) return;
        if (editor.isFocused) return;
        const currentHTML = editor.getHTML();
        if (currentHTML !== content) {
            editor.commands.setContent(content, { emitUpdate: false });
        }
    }, [content, editor]);

    if (!editor) {
        return null;
    }

    const setLink = () => {
        const previousUrl = editor.getAttributes('link').href as string | undefined;
        const url = window.prompt('Enter URL', previousUrl ?? '');

        if (url === null) return;

        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }

        // Block dangerous protocols
        if (/^\s*(javascript|data|vbscript):/i.test(url)) return;

        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    };

    const handleImageSelect = (url: string) => {
        editor.chain().focus().setImage({ src: url }).run();
    };

    const ToolbarBtn = ({
        onClick,
        disabled,
        active,
        title,
        children,
    }: {
        onClick: () => void;
        disabled?: boolean;
        active?: boolean;
        title: string;
        children: React.ReactNode;
    }) => (
        <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClick}
            disabled={disabled}
            className={cn(active ? 'bg-muted' : '')}
            title={title}
        >
            {children}
        </Button>
    );

    const Sep = () => <div className="w-px h-6 bg-border mx-1 self-center" />;

    return (
        <div className="border rounded-md overflow-hidden bg-background">
            {/* Toolbar */}
            <div className="flex flex-wrap gap-0.5 p-2 border-b bg-muted/20">
                {/* Text style */}
                <ToolbarBtn
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    disabled={!editor.can().chain().focus().toggleBold().run()}
                    active={editor.isActive('bold')}
                    title="Bold (Ctrl+B)"
                >
                    <Bold className="w-4 h-4" />
                </ToolbarBtn>
                <ToolbarBtn
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    disabled={!editor.can().chain().focus().toggleItalic().run()}
                    active={editor.isActive('italic')}
                    title="Italic (Ctrl+I)"
                >
                    <Italic className="w-4 h-4" />
                </ToolbarBtn>
                <ToolbarBtn
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    disabled={!editor.can().chain().focus().toggleUnderline().run()}
                    active={editor.isActive('underline')}
                    title="Underline (Ctrl+U)"
                >
                    <UnderlineIcon className="w-4 h-4" />
                </ToolbarBtn>
                <ToolbarBtn
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    disabled={!editor.can().chain().focus().toggleStrike().run()}
                    active={editor.isActive('strike')}
                    title="Strikethrough"
                >
                    <Strikethrough className="w-4 h-4" />
                </ToolbarBtn>
                <ToolbarBtn
                    onClick={() => editor.chain().focus().toggleCode().run()}
                    active={editor.isActive('code')}
                    title="Inline Code"
                >
                    <Code2 className="w-4 h-4" />
                </ToolbarBtn>

                <Sep />

                {/* Headings */}
                <ToolbarBtn
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    active={editor.isActive('heading', { level: 1 })}
                    title="Heading 1"
                >
                    <Heading1 className="w-4 h-4" />
                </ToolbarBtn>
                <ToolbarBtn
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    active={editor.isActive('heading', { level: 2 })}
                    title="Heading 2"
                >
                    <Heading2 className="w-4 h-4" />
                </ToolbarBtn>
                <ToolbarBtn
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    active={editor.isActive('heading', { level: 3 })}
                    title="Heading 3"
                >
                    <Heading3 className="w-4 h-4" />
                </ToolbarBtn>

                <Sep />

                {/* Alignment */}
                <ToolbarBtn
                    onClick={() => editor.chain().focus().setTextAlign('left').run()}
                    active={editor.isActive({ textAlign: 'left' })}
                    title="Align Left"
                >
                    <AlignLeft className="w-4 h-4" />
                </ToolbarBtn>
                <ToolbarBtn
                    onClick={() => editor.chain().focus().setTextAlign('center').run()}
                    active={editor.isActive({ textAlign: 'center' })}
                    title="Align Center"
                >
                    <AlignCenter className="w-4 h-4" />
                </ToolbarBtn>
                <ToolbarBtn
                    onClick={() => editor.chain().focus().setTextAlign('right').run()}
                    active={editor.isActive({ textAlign: 'right' })}
                    title="Align Right"
                >
                    <AlignRight className="w-4 h-4" />
                </ToolbarBtn>

                <Sep />

                {/* Lists & blocks */}
                <ToolbarBtn
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    active={editor.isActive('bulletList')}
                    title="Bullet List"
                >
                    <List className="w-4 h-4" />
                </ToolbarBtn>
                <ToolbarBtn
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    active={editor.isActive('orderedList')}
                    title="Ordered List"
                >
                    <ListOrdered className="w-4 h-4" />
                </ToolbarBtn>
                <ToolbarBtn
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    active={editor.isActive('blockquote')}
                    title="Blockquote"
                >
                    <Quote className="w-4 h-4" />
                </ToolbarBtn>
                <ToolbarBtn
                    onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                    active={editor.isActive('codeBlock')}
                    title="Code Block"
                >
                    <Minus className="w-4 h-4" />
                </ToolbarBtn>
                <ToolbarBtn
                    onClick={() => editor.chain().focus().setHorizontalRule().run()}
                    title="Horizontal Rule"
                >
                    <SeparatorHorizontal className="w-4 h-4" />
                </ToolbarBtn>

                <Sep />

                {/* Media */}
                <ToolbarBtn
                    onClick={setLink}
                    active={editor.isActive('link')}
                    title="Insert Link"
                >
                    <LinkIcon className="w-4 h-4" />
                </ToolbarBtn>

                <MediaPicker
                    onSelect={handleImageSelect}
                    trigger={
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            title="Insert Image"
                        >
                            <ImageIcon className="w-4 h-4" />
                        </Button>
                    }
                />

                <div className="flex-1" />

                {/* History */}
                <ToolbarBtn
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().chain().focus().undo().run()}
                    title="Undo (Ctrl+Z)"
                >
                    <Undo className="w-4 h-4" />
                </ToolbarBtn>
                <ToolbarBtn
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().chain().focus().redo().run()}
                    title="Redo (Ctrl+Shift+Z)"
                >
                    <Redo className="w-4 h-4" />
                </ToolbarBtn>
            </div>

            <EditorContent editor={editor} />
        </div>
    );
}
