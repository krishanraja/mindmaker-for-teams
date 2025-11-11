import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Bot, Users, User, Trash2, Plus } from "lucide-react";
import { Progress } from "@/components/ui/progress";

type TaskCategory = 'ai-capable' | 'ai-human' | 'human-only';

export interface Task {
  id: string;
  description: string;
  category: TaskCategory;
}

interface TaskBreakdownCanvasProps {
  onBreakdownComplete: (breakdown: { tasks: Task[]; automationPct: number }) => void;
  initialTasks?: Task[];
}

export const TaskBreakdownCanvas = ({ 
  onBreakdownComplete,
  initialTasks = []
}: TaskBreakdownCanvasProps) => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [newTaskDesc, setNewTaskDesc] = useState("");

  const addTask = (category: TaskCategory) => {
    if (!newTaskDesc.trim()) return;
    
    const newTask: Task = {
      id: `task-${Date.now()}`,
      description: newTaskDesc,
      category,
    };
    
    setTasks([...tasks, newTask]);
    setNewTaskDesc("");
  };

  const removeTask = (taskId: string) => {
    setTasks(tasks.filter(t => t.id !== taskId));
  };

  const moveTask = (taskId: string, newCategory: TaskCategory) => {
    setTasks(tasks.map(t => 
      t.id === taskId ? { ...t, category: newCategory } : t
    ));
  };

  const getTasksByCategory = (category: TaskCategory) => {
    return tasks.filter(t => t.category === category);
  };

  const aiCapableTasks = getTasksByCategory('ai-capable');
  const aiHumanTasks = getTasksByCategory('ai-human');
  const humanOnlyTasks = getTasksByCategory('human-only');

  const automationPct = tasks.length > 0 
    ? Math.round(((aiCapableTasks.length + aiHumanTasks.length * 0.5) / tasks.length) * 100)
    : 0;

  const handleComplete = () => {
    onBreakdownComplete({ tasks, automationPct });
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Task Decomposition</h3>
        <p className="text-sm text-muted-foreground">
          Break down the process into discrete tasks, then classify each based on what you observed from AI
        </p>
      </div>

      <div className="mb-6 space-y-2">
        <Label>Add a task step</Label>
        <div className="flex gap-2">
          <Input
            value={newTaskDesc}
            onChange={(e) => setNewTaskDesc(e.target.value)}
            placeholder="e.g., Gather data from department heads"
            onKeyDown={(e) => e.key === 'Enter' && addTask('human-only')}
          />
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => addTask('ai-capable')}>
            <Bot className="mr-1 h-3 w-3" /> AI Capable
          </Button>
          <Button size="sm" variant="outline" onClick={() => addTask('ai-human')}>
            <Users className="mr-1 h-3 w-3" /> AI + Human
          </Button>
          <Button size="sm" variant="outline" onClick={() => addTask('human-only')}>
            <User className="mr-1 h-3 w-3" /> Human Only
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4 bg-green-500/10 border-green-500/20">
          <div className="flex items-center gap-2 mb-3">
            <Bot className="h-5 w-5 text-green-600" />
            <h4 className="font-semibold text-sm">AI Capable</h4>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Based on observed performance, AI can handle this independently
          </p>
          <div className="space-y-2">
            {aiCapableTasks.map(task => (
              <div key={task.id} className="group p-2 bg-background rounded text-xs flex items-start justify-between gap-2">
                <span className="flex-1">{task.description}</span>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                  onClick={() => removeTask(task.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4 bg-yellow-500/10 border-yellow-500/20">
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-5 w-5 text-yellow-600" />
            <h4 className="font-semibold text-sm">AI + Human</h4>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            AI drafts or assists, human reviews and refines
          </p>
          <div className="space-y-2">
            {aiHumanTasks.map(task => (
              <div key={task.id} className="group p-2 bg-background rounded text-xs flex items-start justify-between gap-2">
                <span className="flex-1">{task.description}</span>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                  onClick={() => removeTask(task.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4 bg-blue-500/10 border-blue-500/20">
          <div className="flex items-center gap-2 mb-3">
            <User className="h-5 w-5 text-blue-600" />
            <h4 className="font-semibold text-sm">Human Only</h4>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Requires judgment, relationships, or context AI doesn't have
          </p>
          <div className="space-y-2">
            {humanOnlyTasks.map(task => (
              <div key={task.id} className="group p-2 bg-background rounded text-xs flex items-start justify-between gap-2">
                <span className="flex-1">{task.description}</span>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                  onClick={() => removeTask(task.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-4 bg-primary/5">
        <div className="flex items-center justify-between mb-2">
          <Label>AI Augmentation Potential</Label>
          <span className="text-2xl font-bold">{automationPct}%</span>
        </div>
        <Progress value={automationPct} className="h-2" />
        <p className="text-xs text-muted-foreground mt-2">
          Based on {tasks.length} tasks: {aiCapableTasks.length} fully AI, {aiHumanTasks.length} AI-assisted, {humanOnlyTasks.length} human-only
        </p>
      </Card>

      <Button 
        onClick={handleComplete}
        disabled={tasks.length === 0}
        className="w-full mt-4"
      >
        Complete Task Breakdown
      </Button>
    </Card>
  );
};