import * as React from 'react';
import { Command } from 'cmdk';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  FileText, 
  Users, 
  BarChart3, 
  Settings, 
  Image, 
  FolderOpen,
  MessageSquare,
  Calculator,
  ChevronRight,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  LayoutDashboard,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAdminAuth } from '@/hooks/useAdminAuth';

interface CommandItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  href?: string;
  action?: () => void;
  badge?: string;
  category?: string;
  children?: CommandItem[];
}

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate();
  const { role } = useAdminAuth();
  const isSuperAdmin = role === 'super_admin';
  const [search, setSearch] = React.useState('');

  const adminCommands: CommandItem[] = React.useMemo(() => [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="h-4 w-4" />,
      href: '/admin/dashboard',
      category: 'Navigation',
    },
    {
      id: 'portfolio',
      label: 'Portfolio',
      icon: <Image className="h-4 w-4" />,
      href: '/admin/cms/portfolio',
      category: 'CMS',
    },
    {
      id: 'blogs',
      label: 'Blog Posts',
      icon: <FileText className="h-4 w-4" />,
      href: '/admin/cms/blogs',
      category: 'CMS',
    },
    {
      id: 'services',
      label: 'Services',
      icon: <FolderOpen className="h-4 w-4" />,
      href: '/admin/cms/services',
      category: 'CMS',
    },
    {
      id: 'leads',
      label: 'Lead Management',
      icon: <Users className="h-4 w-4" />,
      href: '/admin/crm/leads',
      category: 'CRM',
    },
    {
      id: 'estimate-leads',
      label: 'Estimate Requests',
      icon: <Calculator className="h-4 w-4" />,
      href: '/admin/estimator/leads',
      category: 'Estimator',
    },
    {
      id: 'discovery-analytics',
      label: 'Discovery Analytics',
      icon: <BarChart3 className="h-4 w-4" />,
      href: '/admin/discovery/analytics',
      category: 'Analytics',
    },
    {
      id: 'users',
      label: 'User Management',
      icon: <Users className="h-4 w-4" />,
      href: '/admin/access',
      category: 'Admin',
    },
    ...(isSuperAdmin ? [{
      id: 'settings',
      label: 'System Settings',
      icon: <Settings className="h-4 w-4" />,
      href: '/admin/system/settings',
      category: 'System',
    }] : []),
  ], [isSuperAdmin]);

  const quickActions: CommandItem[] = React.useMemo(() => [
    {
      id: 'add-project',
      label: 'Add New Project',
      icon: <Plus className="h-4 w-4" />,
      action: () => {
        navigate('/admin/cms/portfolio?action=new');
        onOpenChange(false);
      },
      category: 'Quick Actions',
    },
    {
      id: 'add-blog',
      label: 'Create Blog Post',
      icon: <Plus className="h-4 w-4" />,
      action: () => {
        navigate('/admin/cms/blogs?action=new');
        onOpenChange(false);
      },
      category: 'Quick Actions',
    },
    {
      id: 'view-leads',
      label: 'View All Leads',
      icon: <Users className="h-4 w-4" />,
      href: '/admin/crm/leads',
      category: 'Quick Actions',
    },
  ], [navigate, onOpenChange]);

  const handleSelect = (item: CommandItem) => {
    if (item.action) {
      item.action();
    } else if (item.href) {
      navigate(item.href);
      onOpenChange(false);
    }
  };

  const groupedCommands = React.useMemo(() => {
    const groups: Record<string, CommandItem[]> = {};
    
    [...adminCommands, ...quickActions].forEach((cmd) => {
      const category = cmd.category || 'Other';
      if (!groups[category]) groups[category] = [];
      groups[category].push(cmd);
    });
    
    return groups;
  }, [adminCommands, quickActions]);

  const filteredGroups = React.useMemo(() => {
    if (!search.trim()) return groupedCommands;

    const filtered: Record<string, CommandItem[]> = {};
    const lowerSearch = search.toLowerCase();

    Object.entries(groupedCommands).forEach(([category, items]) => {
      const matching = items.filter(
        (item) =>
          item.label.toLowerCase().includes(lowerSearch) ||
          item.id.toLowerCase().includes(lowerSearch)
      );
      if (matching.length > 0) {
        filtered[category] = matching;
      }
    });

    return filtered;
  }, [search, groupedCommands]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onOpenChange(!open);
      }
      if (e.key === 'Escape' && open) {
        onOpenChange(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onOpenChange]);

  return (
    <Command.Dialog
      open={open}
      onOpenChange={onOpenChange}
      className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]"
    >
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" />
      <div className="relative w-full max-w-lg overflow-hidden rounded-lg border bg-popover shadow-lg animate-in fade-in-0 zoom-in-95 duration-200">
        <div className="flex items-center border-b px-4">
          <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
          <Command.Input
            placeholder="Search commands, pages, or actions..."
            value={search}
            onValueChange={setSearch}
            className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
          />
          <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:flex">
            esc
          </kbd>
        </div>
        
        <Command.List className="max-h-[60vh] overflow-y-auto p-2">
          <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
            No results found.
          </Command.Empty>

          {Object.entries(filteredGroups).map(([category, items]) => (
            <Command.Group
              key={category}
              heading={category}
              className="text-xs font-medium text-muted-foreground px-2 py-1.5"
            >
              {items.map((item) => (
                <Command.Item
                  key={item.id}
                  value={item.id}
                  onSelect={() => handleSelect(item)}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-accent hover:text-accent-foreground aria-selected:bg-accent aria-selected:text-accent-foreground"
                >
                  {item.icon && (
                    <span className="flex h-5 w-5 items-center justify-center text-muted-foreground">
                      {item.icon}
                    </span>
                  )}
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="text-xs text-muted-foreground">{item.badge}</span>
                  )}
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Command.Item>
              ))}
            </Command.Group>
          ))}
        </Command.List>

        <div className="border-t p-2">
          <div className="flex items-center justify-between px-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="rounded border bg-muted px-1 font-mono">↑</kbd>
                <kbd className="rounded border bg-muted px-1 font-mono">↓</kbd>
                <span className="ml-1">to navigate</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border bg-muted px-1 font-mono">↵</kbd>
                <span className="ml-1">to select</span>
              </span>
            </div>
            <span className="flex items-center gap-1">
              <kbd className="rounded border bg-muted px-1 font-mono">⌘</kbd>
              <kbd className="rounded border bg-muted px-1 font-mono">K</kbd>
              <span className="ml-1">to toggle</span>
            </span>
          </div>
        </div>
      </div>
    </Command.Dialog>
  );
}

export function useCommandPalette() {
  const [open, setOpen] = React.useState(false);

  return {
    open,
    setOpen,
    CommandPalette: () => <CommandPalette open={open} onOpenChange={setOpen} />,
  };
}
