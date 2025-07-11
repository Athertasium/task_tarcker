"use client"

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Plus, Check, Trash2, Calendar, CheckCircle2, Circle, Sparkles, Target } from 'lucide-react'
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
  const [isAddingTask, setIsAddingTask] = useState(false)

  const dateStr = format(selectedDate, 'yyyy-MM-dd')
  const isToday = format(new Date(), 'yyyy-MM-dd') === dateStr
  const completedCount = tasks.filter(task => task.completed).length
  const totalCount = tasks.length
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

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
        setIsAddingTask(false)
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
        // Optimistic update
        setTasks(prev => prev.map(task => 
          task.id === taskId ? { ...task, completed } : task
        ))
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
        setTasks(prev => prev.filter(task => task.id !== taskId))
        await fetchTasks()
        onTasksChange()
      }
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  const getMotivationalMessage = () => {
    if (totalCount === 0) return "Ready to make today productive?"
    if (completionPercentage === 100) return "Perfect day! You're crushing it! 🎉"
    if (completionPercentage >= 75) return "Almost there! You've got this! 💪"
    if (completionPercentage >= 50) return "Great progress! Keep the momentum! 🚀"
    if (completionPercentage >= 25) return "Good start! Every step counts! ⭐"
    return "Let's get started! Small steps lead to big wins! 🌟"
  }

  return (
    <Card className="w-full max-w-4xl glass card-shadow hover:card-shadow-hover transition-all duration-300 animate-scale-in">
      <CardHeader className="pb-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-lg blur-sm"></div>
              <div className="relative p-2 bg-primary/10 rounded-lg border border-primary/20">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
            </div>
            <div>
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <span>Tasks for {format(selectedDate, 'MMM d, yyyy')}</span>
                {isToday && (
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-xs">
                    Today
                  </Badge>
                )}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {getMotivationalMessage()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {totalCount > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-12 h-2 bg-muted/20 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      completionPercentage === 100 ? 'bg-emerald-400' :
                      completionPercentage >= 75 ? 'bg-blue-400' :
                      completionPercentage >= 50 ? 'bg-yellow-400' :
                      'bg-gray-400'
                    }`}
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
                <span className="text-sm text-muted-foreground">
                  {completionPercentage}%
                </span>
              </div>
            )}
            
            <Badge 
              variant={completedCount === totalCount && totalCount > 0 ? "default" : "secondary"}
              className={`${
                completedCount === totalCount && totalCount > 0 
                  ? "bg-emerald-600 text-white border-emerald-500 shadow-emerald-500/20 shadow-lg" 
                  : "bg-primary/10 text-primary border-primary/20"
              } transition-all duration-300`}
            >
              <Target className="w-3 h-3 mr-1" />
              {completedCount}/{totalCount}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Add new task section */}
        <div className={`transition-all duration-300 ${isAddingTask ? 'space-y-4' : ''}`}>
          {!isAddingTask ? (
            <Button 
              onClick={() => setIsAddingTask(true)}
              className="w-full btn-hover-lift bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 hover:border-primary/30"
              variant="outline"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Task
            </Button>
          ) : (
            <div className="space-y-4 p-4 sm:p-6 glass rounded-lg border border-primary/20 animate-slide-up">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-primary" />
                <h3 className="font-medium text-primary">Create New Task</h3>
              </div>
              
              <Input
                placeholder="What do you want to accomplish?"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && addTask()}
                className="bg-background/50 border-border/50 focus:border-primary focus:ring-primary/20 transition-all"
                autoFocus
              />
              
              <Textarea
                placeholder="Add a description (optional)..."
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                rows={2}
                className="bg-background/50 border-border/50 focus:border-primary focus:ring-primary/20 resize-none transition-all"
              />
              
              <div className="flex gap-2">
                <Button 
                  onClick={addTask} 
                  disabled={loading || !newTask.title.trim()} 
                  className="flex-1 bg-primary hover:bg-primary/90 btn-hover-lift"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  {loading ? 'Adding...' : 'Add Task'}
                </Button>
                <Button 
                  onClick={() => {
                    setIsAddingTask(false)
                    setNewTask({ title: '', description: '' })
                  }}
                  variant="outline"
                  className="border-border/50 hover:bg-muted/50"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Task list */}
        <div className="space-y-3">
          {tasks.map((task, index) => (
            <div
              key={task.id}
              className={`group flex items-start gap-4 p-4 sm:p-5 rounded-lg border transition-all duration-300 animate-fade-in hover:scale-[1.02] ${
                task.completed 
                  ? 'bg-emerald-950/20 border-emerald-800/30 shadow-emerald-500/5' 
                  : 'glass border-border/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5'
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleTask(task.id, !task.completed)}
                className={`p-0 h-6 w-6 rounded-full border-2 transition-all duration-300 hover:scale-110 ${
                  task.completed 
                    ? 'bg-emerald-600 hover:bg-emerald-700 border-emerald-600 shadow-emerald-500/30 shadow-lg celebrate' 
                    : 'border-muted-foreground hover:border-primary hover:bg-primary/10 hover:shadow-primary/20 hover:shadow-md'
                }`}
              >
                {task.completed ? (
                  <CheckCircle2 className="w-4 h-4 text-white" />
                ) : (
                  <Circle className="w-4 h-4" />
                )}
              </Button>
              
              <div className="flex-1 min-w-0 space-y-1">
                <div className={`font-medium transition-all duration-300 ${
                  task.completed 
                    ? 'line-through text-muted-foreground' 
                    : 'text-foreground group-hover:text-primary'
                }`}>
                  {task.title}
                </div>
                {task.description && (
                  <div className={`text-sm transition-all duration-300 ${
                    task.completed 
                      ? 'line-through text-muted-foreground/70' 
                      : 'text-muted-foreground'
                  }`}>
                    {task.description}
                  </div>
                )}
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteTask(task.id)}
                className="opacity-0 group-hover:opacity-100 p-2 h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 transition-all duration-200 hover:scale-110"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          
          {tasks.length === 0 && !isAddingTask && (
            <div className="text-center py-12 space-y-4 animate-fade-in">
              <div className="relative mx-auto w-16 h-16">
                <div className="absolute inset-0 bg-muted/20 rounded-full blur-xl"></div>
                <div className="relative flex items-center justify-center w-16 h-16 bg-muted/10 rounded-full border border-muted/20">
                  <Calendar className="w-8 h-8 text-muted-foreground/50" />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-lg font-medium text-muted-foreground">
                  {isToday ? "Ready to start your day?" : "No tasks for this day"}
                </p>
                <p className="text-sm text-muted-foreground/70 max-w-md mx-auto">
                  {isToday 
                    ? "Add your first task above and begin building productive habits!"
                    : "Click 'Add New Task' to plan something amazing for this date."
                  }
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Completion celebration */}
        {completedCount === totalCount && totalCount > 0 && (
          <div className="text-center py-6 space-y-3 animate-fade-in bg-emerald-950/20 rounded-lg border border-emerald-800/30">
            <div className="text-4xl">🎉</div>
            <div className="space-y-1">
              <p className="font-semibold text-emerald-400">Perfect Day Completed!</p>
              <p className="text-sm text-muted-foreground">
                You've completed all {totalCount} task{totalCount !== 1 ? 's' : ''}. Amazing work!
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}