import { useState, useMemo, useEffect, type ReactNode } from 'react';
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
import { usePermissions } from '@/hooks/usePermissions';
import { ADMIN_ROUTES } from '@/lib/admin-routes';

interface CommandItem {
  id: string;
  label: string;
  icon?: ReactNode;
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
  const { hasRole } = usePermissions();
  const isSuperAdmin = hasRole('super_admin');
  const [search, setSearch] = useState('');

  const adminCommands: CommandItem[] = useMemo(() => [
    {
      id: 'dashboard',
      label: ADMIN_ROUTES.dashboard.label,
      icon: <LayoutDashboard className="h-4 w-4" />,
      href: ADMIN_ROUTES.dashboard.path,
      category: 'Navigation',
    },
    {
      id: 'portfolio',
      label: ADMIN_ROUTES.cmsPortfolio.label,
      icon: <Image className="h-4 w-4" />,
      href: ADMIN_ROUTES.cmsPortfolio.path,
      category: 'CMS',
    },
    {
      id: 'transformations',
      label: ADMIN_ROUTES.cmsTransformations.label,
      icon: <Image className="h-4 w-4" />,
      href: ADMIN_ROUTES.cmsTransformations.path,
      category: 'CMS',
    },
    {
      id: 'blogs',
      label: ADMIN_ROUTES.cmsBlogs.label,
      icon: <FileText className="h-4 w-4" />,
      href: ADMIN_ROUTES.cmsBlogs.path,
      category: 'CMS',
    },
    {
      id: 'services',
      label: ADMIN_ROUTES.cmsServices.label,
      icon: <FolderOpen className="h-4 w-4" />,
      href: ADMIN_ROUTES.cmsServices.path,
      category: 'CMS',
    },
    {
      id: 'leads',
      label: ADMIN_ROUTES.crmLeads.label,
      icon: <Users className="h-4 w-4" />,
      href: ADMIN_ROUTES.crmLeads.path,
      category: 'CRM',
    },
    {
      id: 'estimate-leads',
      label: ADMIN_ROUTES.estimatorLeads.label,
      icon: <Calculator className="h-4 w-4" />,
      href: ADMIN_ROUTES.estimatorLeads.path,
      category: 'Estimator',
    },
    {
      id: 'discovery-analytics',
      label: ADMIN_ROUTES.discoveryAnalytics.label,
      icon: <BarChart3 className="h-4 w-4" />,
      href: ADMIN_ROUTES.discoveryAnalytics.path,
      category: 'Analytics',
    },
    {
      id: 'users',
      label: 'User Management',
      icon: <Users className="h-4 w-4" />,
      href: ADMIN_ROUTES.userAccess.path,
      category: 'Admin',
    },
    ...(isSuperAdmin ? [{
      id: 'settings',
      label: ADMIN_ROUTES.systemSettings.label,
      icon: <Settings className="h-4 w-4" />,
      href: ADMIN_ROUTES.systemSettings.path,
      category: 'System',
    }] : []),
  ], [isSuperAdmin]);

  const quickActions: CommandItem[] = useMemo(() => [
    {
      id: 'add-project',
      label: 'Add New Project',
      icon: <Plus className="h-4 w-4" />,
      action: () => {
        navigate(`${ADMIN_ROUTES.cmsPortfolio.path}?action=new`);
        onOpenChange(false);
      },
      category: 'Quick Actions',
    },
    {
      id: 'add-blog',
      label: 'Create Blog Post',
      icon: <Plus className="h-4 w-4" />,
      action: () => {
        navigate(`${ADMIN_ROUTES.cmsBlogs.path}?action=new`);
        onOpenChange(false);
      },
      category: 'Quick Actions',
    },
    {
      id: 'view-leads',
      label: 'View All Leads',
      icon: <Users className="h-4 w-4" />,
      href: ADMIN_ROUTES.crmLeads.path,
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

  const groupedCommands = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {};
    
    [...adminCommands, ...quickActions].forEach((cmd) => {
      const category = cmd.category || 'Other';
      if (!groups[category]) groups[category] = [];
      groups[category].push(cmd);
    });
    
    return groups;
  }, [adminCommands, quickActions]);

  const filteredGroups = useMemo(() => {
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

  useEffect(() => {
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
  const [open, setOpen] = useState(false);

  return {
    open,
    setOpen,
    CommandPalette: () => <CommandPalette open={open} onOpenChange={setOpen} />,
  };
}
