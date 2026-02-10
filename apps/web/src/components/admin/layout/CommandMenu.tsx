
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
    Calculator,
    Calendar,
    CreditCard,
    Settings,
    Smile,
    User,
    LayoutDashboard,
    FileText,
    Briefcase,
    Image,
    MessageSquare,
    Mail,
    FolderKanban,
    Award,
    Palette,
    Users
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export function CommandMenu() {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();

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
            <p className="text-sm text-muted-foreground hidden lg:flex">
                Press{" "}
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 ml-1">
                    <span className="text-xs">Ctrl</span>K
                </kbd>
            </p>
            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput placeholder="Type a command or search..." />
                <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup heading="Pages">
                        <CommandItem onSelect={() => runCommand(() => navigate("/admin/dashboard"))}>
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            <span>Dashboard</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => navigate("/admin/blogs"))}>
                            <FileText className="mr-2 h-4 w-4" />
                            <span>Blogs</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => navigate("/admin/leads"))}>
                            <Users className="mr-2 h-4 w-4" />
                            <span>Leads</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => navigate("/admin/projects"))}>
                            <FolderKanban className="mr-2 h-4 w-4" />
                            <span>Projects</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => navigate("/admin/gallery"))}>
                            <Image className="mr-2 h-4 w-4" />
                            <span>Gallery</span>
                        </CommandItem>
                    </CommandGroup>
                    <CommandSeparator />
                    <CommandGroup heading="Settings">
                        <CommandItem onSelect={() => runCommand(() => navigate("/admin/settings"))}>
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Settings</span>
                            <CommandShortcut>Ctrl+S</CommandShortcut>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => navigate("/admin/team"))}>
                            <User className="mr-2 h-4 w-4" />
                            <span>Team</span>
                        </CommandItem>
                    </CommandGroup>
                </CommandList>
            </CommandDialog>
        </>
    );
}
