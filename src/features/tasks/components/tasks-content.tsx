"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckSquare, Plus, AlertCircle, Trash2, Calendar, Smartphone, Loader2 } from "lucide-react";
import { toggleTaskAction, createTaskAction, deleteTaskAction, syncTodoistTasksAction } from "../actions";
import { Todo } from "@prisma/client";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface TasksContentProps {
  tasks: Todo[];
  activeFilter: "inbox" | "today" | "upcoming" | "completed";
}

export function TasksContent({ tasks, activeFilter }: TasksContentProps) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [priority, setPriority] = useState("normal");
  const [category, setCategory] = useState("Work");

  const handleSyncTodoist = async () => {
    setSyncing(true);
    try {
      const res = await syncTodoistTasksAction();
      if (res.success) {
        toast.success(`📱 Todoist sync complete! Imported ${res.syncedCount || 0} mobile tasks.`);
      } else {
        toast.error(res.reason || "Failed to sync tasks");
      }
    } catch {
      toast.error("Failed to sync with mobile Todoist");
    } finally {
      setSyncing(false);
    }
  };

  const handleTabChange = (val: string) => {
    router.push(`/tasks?filter=${val}`);
  };

  const handleToggle = async (taskId: string) => {
    try {
      const res = await toggleTaskAction(taskId);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Task status updated!");
      }
    } catch {
      toast.error("Failed to toggle task");
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.set("title", title);
      formData.set("description", description);
      formData.set("dueDate", dueDate);
      formData.set("priority", priority);
      formData.set("category", category);

      const res = await createTaskAction(formData);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Task created successfully!");
        setModalOpen(false);
        setTitle("");
        setDescription("");
      }
    } catch {
      toast.error("Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await deleteTaskAction(id);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Task deleted");
        router.refresh();
      }
    } catch {
      toast.error("Failed to delete task");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Task Manager</h1>
          <p className="text-sm text-muted-foreground">Manage your daily priorities, overdue tasks, and task completions.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            disabled={syncing}
            onClick={handleSyncTodoist}
            className="border-violet-500/30 text-violet-400 hover:bg-violet-500/10 flex items-center gap-1.5 text-xs font-semibold"
          >
            {syncing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Smartphone className="w-3.5 h-3.5" />}
            Sync Mobile Tasks
          </Button>
          <Button className="bg-violet-600 hover:bg-violet-700 text-white flex items-center gap-1.5 text-xs" onClick={() => setModalOpen(true)}>
            <Plus className="w-4 h-4" /> Add Task
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <Tabs defaultValue={activeFilter} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid grid-cols-4 w-full max-w-md">
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="inbox">All Open</TabsTrigger>
          <TabsTrigger value="completed">Done</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Task List */}
      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="py-12 text-center border rounded-xl bg-muted/10 space-y-2">
            <CheckSquare className="w-8 h-8 mx-auto text-muted-foreground/50" />
            <p className="text-sm font-medium text-muted-foreground">No tasks found for this view.</p>
            <Button size="sm" onClick={() => setModalOpen(true)}>Create a Task</Button>
          </div>
        ) : (
          tasks.map((task) => (
            <Card key={task.id} className="p-3.5 flex items-center justify-between hover:border-violet-500/40 transition-colors">
              <div className="flex items-start gap-3">
                <button
                  onClick={() => handleToggle(task.id)}
                  className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center transition-colors ${
                    task.status === "done"
                      ? "bg-violet-600 text-white"
                      : "border-2 border-muted-foreground/40 hover:border-violet-500"
                  }`}
                >
                  {task.status === "done" && <CheckSquare className="w-4 h-4" />}
                </button>
                <div className="space-y-1">
                  <span className={`text-sm font-semibold block ${task.status === "done" ? "line-through text-muted-foreground" : ""}`}>
                    {task.title}
                  </span>
                  {task.description && (
                    <p className="text-xs text-muted-foreground">{task.description}</p>
                  )}
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground pt-1">
                    {task.dueDate && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-violet-500" />
                        {format(new Date(task.dueDate), "MMM d")}
                      </span>
                    )}
                    {task.category && (
                      <span className="px-1.5 py-0.5 rounded bg-muted font-medium">{task.category}</span>
                    )}
                    {task.priority === "urgent" && (
                      <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-500 font-semibold flex items-center gap-0.5">
                        <AlertCircle className="w-3 h-3" /> Urgent
                      </span>
                    )}
                    {task.priority === "high" && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 font-semibold">High Priority</span>
                    )}
                  </div>
                </div>
              </div>

              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                onClick={() => handleDelete(task.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </Card>
          ))
        )}
      </div>

      {/* Modal for New Task */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">Create New Task</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-4 text-xs">
            <div>
              <Label className="text-xs">Task Title *</Label>
              <Input
                placeholder="e.g. Review weekly progress, Meal prep for 3 days"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <Label className="text-xs">Description (Optional)</Label>
              <Input
                placeholder="Details or subtasks..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Due Date</Label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
              <div>
                <Label className="text-xs">Priority</Label>
                <select
                  className="w-full h-9 rounded-md border bg-background px-3 text-xs"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent 🔥</option>
                </select>
              </div>
            </div>

            <div>
              <Label className="text-xs">Category</Label>
              <Input
                placeholder="e.g. Fitness, Work, Life"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button variant="outline" size="sm" type="button" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={loading || !title} className="bg-violet-600 hover:bg-violet-700 text-white">
                Save Task
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
