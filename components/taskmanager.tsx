"use client"

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Plus, Check, Trash2, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Task {
  id: string
  title: string
  description?: string
  completed: boolean
}

interface TaskManagerProps {
  selectedDate: Date
  onTasksChange: () => void
}

export function TaskManager({ selectedDate, onTasksChange }: TaskManagerProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState({ title: '', description: '' })
  const [loading, setLoading] = useState(false)

  const dateStr = format(selectedDate, 'yyyy-MM-dd')

  useEffect(() => {
    fetchTasks()
  }, [selectedDate])

  const fetchTasks = async () => {
    try {
      const response = await fetch(`/api/tasks?date=${dateStr}`)
      if (response.ok) {
        const data = await response.json()
        setTasks(data.tasks || [])
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
    }
  }

  const addTask = async () => {
    if (!newTask.title.trim()) return

    setLoading(true)
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newTask,
          date: dateStr
        })
      })

      if (response.ok) {
        setNewTask({ title: '', description: '' })
        await fetchTasks()
        onTasksChange()
      }
    } catch (error) {
      console.error('Error adding task:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleTask = async (taskId: string, completed: boolean) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed })
      })

      if (response.ok) {
        await fetchTasks()
        onTasksChange()
      }
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const deleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchTasks()
        onTasksChange()
      }
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  const completedCount = tasks.filter(task => task.completed).length
  const totalCount = tasks.length

  return (
    <Card className="w-full max-w-2xl animate-fade-in">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            <span>Tasks for {format(selectedDate, 'MMM d, yyyy')}</span>
          </div>
          <Badge 
            variant={completedCount === totalCount && totalCount > 0 ? "default" : "secondary"}
            className="bg-primary/10 text-primary border-primary/20"
          >
            {completedCount}/{totalCount}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add new task */}
        <div className="space-y-3 p-4 bg-secondary/50 rounded-lg border border-border/50">
          <Input
            placeholder="What do you want to accomplish today?"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && addTask()}
            className="bg-background/50 border-border/50 focus:border-primary"
          />
          <Textarea
            placeholder="Add a description (optional)..."
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            rows={2}
            className="bg-background/50 border-border/50 focus:border-primary resize-none"
          />
          <Button 
            onClick={addTask} 
            disabled={loading || !newTask.title.trim()} 
            className="w-full bg-primary hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>
        </div>

        {/* Task list */}
        <div className="space-y-3">
          {tasks.map((task, index) => (
            <div
              key={task.id}
              className={`flex items-start gap-3 p-4 rounded-lg border transition-all duration-200 animate-fade-in ${
                task.completed 
                  ? 'bg-emerald-950/30 border-emerald-800/50 shadow-sm' 
                  : 'bg-card border-border hover:border-primary/50 hover:shadow-md'
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleTask(task.id, !task.completed)}
                className={`p-0 h-6 w-6 rounded-full border-2 transition-all duration-200 ${
                  task.completed 
                    ? 'bg-emerald-600 hover:bg-emerald-700 border-emerald-600' 
                    : 'border-muted-foreground hover:border-primary hover:bg-primary/10'
                }`}
              >
                {task.completed && <Check className="w-3 h-3 text-white" />}
              </Button>
              
              <div className="flex-1 min-w-0">
                <div className={`font-medium transition-all duration-200 ${
                  task.completed ? 'line-through text-muted-foreground' : 'text-foreground'
                }`}>
                  {task.title}
                </div>
                {task.description && (
                  <div className={`text-sm mt-1 transition-all duration-200 ${
                    task.completed ? 'line-through text-muted-foreground/70' : 'text-muted-foreground'
                  }`}>
                    {task.description}
                  </div>
                )}
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteTask(task.id)}
                className="p-1 h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          
          {tasks.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No tasks for this day</p>
              <p className="text-sm">Add your first task above to get started!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
