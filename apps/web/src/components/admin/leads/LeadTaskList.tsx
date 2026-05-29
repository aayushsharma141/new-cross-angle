import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { taskRepo } from "@/repositories/TaskRepository";
import { CheckCircle2, Circle, Clock, Plus, Trash2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, isPast } from "date-fns";

interface LeadTaskListProps {
  leadId: string;
  isReadOnly?: boolean;
}

export function LeadTaskList({ leadId, isReadOnly }: LeadTaskListProps) {
  const queryClient = useQueryClient();
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["lead-tasks", leadId],
    queryFn: () => taskRepo.getTasksForLead(leadId),
  });

  const createTask = useMutation({
    mutationFn: (title: string) => taskRepo.createTask({ lead_id: leadId, title }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead-tasks", leadId] });
      setNewTaskTitle("");
    },
  });

  const toggleTask = useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
      taskRepo.toggleTaskCompletion(id, completed),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead-tasks", leadId] });
    },
  });

  const deleteTask = useMutation({
    mutationFn: (id: string) => taskRepo.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead-tasks", leadId] });
    },
  });

  if (isLoading) {
    return <div className="p-4 text-center text-muted-foreground text-sm">Loading tasks...</div>;
  }

  const openTasks = tasks.filter(t => !t.completed_at);
  const completedTasks = tasks.filter(t => !!t.completed_at);

  return (
    <div className="space-y-4">
      {!isReadOnly && (
        <div className="flex flex-col gap-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (newTaskTitle.trim()) {
                createTask.mutate(newTaskTitle.trim());
              }
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Add a new task..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="flex-1 bg-[hsl(var(--admin-surface))] border border-[hsl(var(--admin-border))] rounded-md px-3 py-2 text-sm text-[hsl(var(--admin-text))] placeholder:text-muted-foreground focus:outline-none focus:border-[hsl(var(--admin-primary))]"
            />
            <button
              type="submit"
              title="Add task"
              aria-label="Add task"
              disabled={!newTaskTitle.trim() || createTask.isPending}
              className="bg-[hsl(var(--admin-primary))] text-primary-foreground p-2 rounded-md hover:opacity-90 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      <div className="space-y-2">
        {openTasks.map(task => (
          <TaskItem 
            key={task.id} 
            task={task} 
            onToggle={() => toggleTask.mutate({ id: task.id, completed: true })}
            onDelete={() => deleteTask.mutate(task.id)}
            isReadOnly={isReadOnly}
          />
        ))}
        {openTasks.length === 0 && (
          <div className="text-center py-4 text-sm text-muted-foreground bg-[hsl(var(--admin-surface))]/50 rounded-lg border border-dashed border-[hsl(var(--admin-border))]">
            No open tasks
          </div>
        )}
      </div>

      {completedTasks.length > 0 && (
        <div className="mt-8">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Completed ({completedTasks.length})
          </h4>
          <div className="space-y-2 opacity-60">
            {completedTasks.map(task => (
              <TaskItem 
                key={task.id} 
                task={task} 
                onToggle={() => toggleTask.mutate({ id: task.id, completed: false })}
                onDelete={() => deleteTask.mutate(task.id)}
                isReadOnly={isReadOnly}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface CrmTask {
  id: string;
  title: string;
  completed_at?: string | null;
  due_at?: string | null;
}

function TaskItem({ task, onToggle, onDelete, isReadOnly }: { task: CrmTask, onToggle: () => void, onDelete: () => void, isReadOnly?: boolean }) {
  const isOverdue = !task.completed_at && task.due_at && isPast(new Date(task.due_at));
  
  return (
    <div className="group flex items-start gap-3 p-3 bg-[hsl(var(--admin-surface))] border border-[hsl(var(--admin-border))] rounded-lg hover:border-[hsl(var(--admin-border-subtle))] transition-colors">
      <button
        onClick={onToggle}
        disabled={isReadOnly}
        title={task.completed_at ? "Mark as incomplete" : "Mark as complete"}
        aria-label={task.completed_at ? "Mark as incomplete" : "Mark as complete"}
        className="mt-0.5 shrink-0 text-muted-foreground hover:text-white transition-colors disabled:opacity-50"
      >
        {task.completed_at ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
        ) : (
          <Circle className="w-4 h-4" />
        )}
      </button>
      
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm text-white", task.completed_at && "line-through text-muted-foreground")}>
          {task.title}
        </p>
        
        {task.due_at && !task.completed_at && (
          <div className={cn("flex items-center gap-1 mt-1 text-[11px]", isOverdue ? "text-red-400" : "text-muted-foreground")}>
            {isOverdue ? <AlertCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
            <span>{isOverdue ? "Overdue by " : "Due in "}{formatDistanceToNow(new Date(task.due_at))}</span>
          </div>
        )}
      </div>

      {!isReadOnly && (
        <button 
          onClick={onDelete}
          title="Delete task"
          aria-label="Delete task"
          className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-red-400 transition-all shrink-0"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
