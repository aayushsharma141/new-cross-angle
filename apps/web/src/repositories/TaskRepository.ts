import { supabase } from "@/integrations/supabase/client";
import { ITaskRepository, LeadTask, CreateTaskDTO, UpdateTaskDTO } from "./interfaces/TaskRepository";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as unknown as { from: (table: string) => any };

export class TaskRepository implements ITaskRepository {
  async getTasksForLead(leadId: string): Promise<LeadTask[]> {
    const { data, error } = await db
      .from('lead_tasks')
      .select('*')
      .eq('lead_id', leadId)
      .order('completed_at', { ascending: true, nullsFirst: true })
      .order('due_at', { ascending: true, nullsFirst: true })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as LeadTask[];
  }

  async createTask(data: CreateTaskDTO): Promise<LeadTask> {
    const { data: result, error } = await db
      .from('lead_tasks')
      .insert({
        lead_id: data.lead_id,
        title: data.title,
        description: data.description,
        due_at: data.due_at,
        priority: data.priority || 'normal'
      })
      .select()
      .single();

    if (error) throw error;
    return result as LeadTask;
  }

  async updateTask(id: string, data: UpdateTaskDTO): Promise<LeadTask> {
    const { data: result, error } = await db
      .from('lead_tasks')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return result as LeadTask;
  }

  async deleteTask(id: string): Promise<void> {
    const { error } = await db
      .from('lead_tasks')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async toggleTaskCompletion(id: string, completed: boolean): Promise<LeadTask> {
    const { data: result, error } = await db
      .from('lead_tasks')
      .update({
        completed_at: completed ? new Date().toISOString() : null
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return result as LeadTask;
  }
}

export const taskRepo = new TaskRepository();
