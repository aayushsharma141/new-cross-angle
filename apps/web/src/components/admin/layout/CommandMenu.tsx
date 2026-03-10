import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from "@/components/ui/command";
import { useEffect, useState } from "react";
import {
    Settings,
    User,
    LayoutDashboard,
    FileText,
    Briefcase,
    Image as ImageIcon,
    MessageSquare,
    FolderKanban,
    MousePointerClick,
    ShieldCheck,
    Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGlobalSearch } from "@/hooks/useGlobalSearch";

export function CommandMenu() {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const { pages, blogs, projects, media, isLoading } = useGlobalSearch();

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    const runCommand = (command: () => void) => {
        setOpen(false);
        command();
    };

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="text-sm text-muted-foreground hidden lg:flex items-center hover:text-slate-300 transition-colors"
            >
                Search...{" "}
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 ml-2">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </button>
            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput placeholder="Type a command or search content..." />
                <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>

                    {/* Quick Navigation */}
                    <CommandGroup heading="Navigation">
                        <CommandItem onSelect={() => runCommand(() => navigate("/admin/dashboard"))}>
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            <span>Dashboard</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => navigate("/admin/cms/pages"))}>
                            <FileText className="mr-2 h-4 w-4" />
                            <span>Pages</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => navigate("/admin/cms/blogs"))}>
                            <MessageSquare className="mr-2 h-4 w-4" />
                            <span>Blogs</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => navigate("/admin/cms/portfolio"))}>
                            <Briefcase className="mr-2 h-4 w-4" />
                            <span>Portfolio</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => navigate("/admin/cms/media"))}>
                            <ImageIcon className="mr-2 h-4 w-4" />
                            <span>Media Library</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => navigate("/admin/crm/leads"))}>
                            <MousePointerClick className="mr-2 h-4 w-4" />
                            <span>Leads</span>
                        </CommandItem>
                    </CommandGroup>
                    <CommandSeparator />

                    {/* Dynamic Pages */}
                    {pages.length > 0 && (
                        <CommandGroup heading="Pages">
                            {pages.map((p) => (
                                <CommandItem key={`page-${p.id}`} onSelect={() => runCommand(() => navigate(`/admin/cms/pages?edit=${p.slug}`))}>
                                    <FileText className="mr-2 h-4 w-4 text-emerald-400" />
                                    <span>{p.title}</span>
                                    <span className="ml-auto text-xs text-slate-500">Page</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}

                    {/* Dynamic Blogs */}
                    {blogs.length > 0 && (
                        <CommandGroup heading="Blogs">
                            {blogs.map((b) => (
                                <CommandItem key={`blog-${b.id}`} onSelect={() => runCommand(() => navigate(`/admin/cms/blogs?edit=${'slug' in b ? b.slug : b.id}`))}>
                                    <MessageSquare className="mr-2 h-4 w-4 text-indigo-400" />
                                    <span>{b.title}</span>
                                    <span className="ml-auto text-xs text-slate-500 capitalize">{b.status}</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}

                    {/* Dynamic Projects */}
                    {projects.length > 0 && (
                        <CommandGroup heading="Projects">
                            {projects.map((proj) => (
                                <CommandItem key={`proj-${proj.id}`} onSelect={() => runCommand(() => navigate(`/admin/cms/portfolio?edit=${'slug' in proj ? proj.slug : proj.id}`))}>
                                    <Briefcase className="mr-2 h-4 w-4 text-orange-400" />
                                    <span>{proj.title}</span>
                                    <span className="ml-auto text-xs text-slate-500">{proj.category}</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}

                    {/* Dynamic Media */}
                    {media.length > 0 && (
                        <CommandGroup heading="Media">
                            {media.map((m) => (
                                <CommandItem key={`media-${m.id}`} onSelect={() => runCommand(() => navigate(`/admin/cms/media?file=${encodeURIComponent(m.file_name)}&search=${encodeURIComponent(m.file_name)}`))}>
                                    <ImageIcon className="mr-2 h-4 w-4 text-pink-400" />
                                    <span>{m.file_name}</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}

                    <CommandSeparator />
                    <CommandGroup heading="System">
                        <CommandItem onSelect={() => runCommand(() => navigate("/admin/system/settings"))}>
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Settings</span>
                            <CommandShortcut>⌘S</CommandShortcut>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => navigate("/admin/system/team-members"))}>
                            <ShieldCheck className="mr-2 h-4 w-4" />
                            <span>Team Members</span>
                        </CommandItem>
                    </CommandGroup>
                </CommandList>
            </CommandDialog>
        </>
    );
}
