export interface LeadTask {
  id: string;
  lead_id: string;
  title: string;
  description?: string;
  due_at?: string;
  completed_at?: string;
  created_by?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  created_at: string;
}

export interface CreateTaskDTO {
  lead_id: string;
  title: string;
  description?: string;
  due_at?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

export interface UpdateTaskDTO {
  title?: string;
  description?: string;
  due_at?: string;
  completed_at?: string | null;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

export interface ITaskRepository {
  getTasksForLead(leadId: string): Promise<LeadTask[]>;
  createTask(data: CreateTaskDTO): Promise<LeadTask>;
  updateTask(id: string, data: UpdateTaskDTO): Promise<LeadTask>;
  deleteTask(id: string): Promise<void>;
  toggleTaskCompletion(id: string, completed: boolean): Promise<LeadTask>;
}
