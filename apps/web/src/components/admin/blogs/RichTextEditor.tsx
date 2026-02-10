
import { useEffect } from "react";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { Button } from "@/components/ui/button";
import { MediaPicker } from "@/components/admin/media/MediaPicker";
import {
    Bold, Italic, Strikethrough,
    Heading1, Heading2, Heading3,
    List, ListOrdered, Quote,
    Undo, Redo, Link as LinkIcon, Image as ImageIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
    content: string;
    onChange: (content: string) => void;
    placeholder?: string;
    className?: string;
}

export function RichTextEditor({ content, onChange, placeholder, className }: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Image.configure({
                inline: true,
                allowBase64: true,
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-primary underline',
                },
            }),
        ],
        content: content,
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

    // Sync content prop with editor content
    if (editor && content !== editor.getHTML()) {
        // Only update if difference is significant to avoid cursor jumping?
        // Actually, setting content on every render loop is bad.
        // We should only set it if it's completely different or initial load.
        // A better approach is usually useEffect.
    }

    useEffect(() => {
        if (editor && content) {
            const currentContent = editor.getHTML();
            if (currentContent !== content) {
                // This check is still risky if "content" is lagging behind editor state slightly.
                // But for "loading" a post it is necessary.
                // A common pattern is to only set if editor is empty or drastically different?
                // Let's assume this is mostly for initial load or external updates.

                // To avoid cursor jumping, we can check if focused.
                if (!editor.isFocused) {
                    editor.commands.setContent(content);
                }
            }
        }
    }, [content, editor]);

    if (!editor) {
        return null;
    }

    const setLink = () => {
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL', previousUrl);

        if (url === null) {
            return;
        }

        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }

        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    };

    const handleImageSelect = (url: string) => {
        editor.chain().focus().setImage({ src: url }).run();
    };

    return (
        <div className="border rounded-md overflow-hidden bg-background">
            {/* Toolbar */}
            <div className="flex flex-wrap gap-1 p-2 border-b bg-muted/20">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    disabled={!editor.can().chain().focus().toggleBold().run()}
                    className={cn(editor.isActive('bold') ? 'bg-muted' : '')}
                    title="Bold"
                >
                    <Bold className="w-4 h-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    disabled={!editor.can().chain().focus().toggleItalic().run()}
                    className={cn(editor.isActive('italic') ? 'bg-muted' : '')}
                    title="Italic"
                >
                    <Italic className="w-4 h-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    disabled={!editor.can().chain().focus().toggleStrike().run()}
                    className={cn(editor.isActive('strike') ? 'bg-muted' : '')}
                    title="Strikethrough"
                >
                    <Strikethrough className="w-4 h-4" />
                </Button>

                <div className="w-px h-6 bg-border mx-1" />

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    className={cn(editor.isActive('heading', { level: 1 }) ? 'bg-muted' : '')}
                    title="Heading 1"
                >
                    <Heading1 className="w-4 h-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={cn(editor.isActive('heading', { level: 2 }) ? 'bg-muted' : '')}
                    title="Heading 2"
                >
                    <Heading2 className="w-4 h-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    className={cn(editor.isActive('heading', { level: 3 }) ? 'bg-muted' : '')}
                    title="Heading 3"
                >
                    <Heading3 className="w-4 h-4" />
                </Button>

                <div className="w-px h-6 bg-border mx-1" />

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={cn(editor.isActive('bulletList') ? 'bg-muted' : '')}
                    title="Bullet List"
                >
                    <List className="w-4 h-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={cn(editor.isActive('orderedList') ? 'bg-muted' : '')}
                    title="Ordered List"
                >
                    <ListOrdered className="w-4 h-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    className={cn(editor.isActive('blockquote') ? 'bg-muted' : '')}
                    title="Quote"
                >
                    <Quote className="w-4 h-4" />
                </Button>

                <div className="w-px h-6 bg-border mx-1" />

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={setLink}
                    className={cn(editor.isActive('link') ? 'bg-muted' : '')}
                    title="Link"
                >
                    <LinkIcon className="w-4 h-4" />
                </Button>

                <MediaPicker
                    onSelect={handleImageSelect}
                    trigger={
                        <Button
                            variant="ghost"
                            size="sm"
                            title="Insert Image"
                        >
                            <ImageIcon className="w-4 h-4" />
                        </Button>
                    }
                />

                <div className="flex-1" />

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().chain().focus().undo().run()}
                    title="Undo"
                >
                    <Undo className="w-4 h-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().chain().focus().redo().run()}
                    title="Redo"
                >
                    <Redo className="w-4 h-4" />
                </Button>
            </div>

            <EditorContent editor={editor} />
        </div>
    );
}
