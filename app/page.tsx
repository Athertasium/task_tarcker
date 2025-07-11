"use client"

import { useState, useEffect } from 'react'
import { Calendar, Target, TrendingUp, Sparkles } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Heatmap } from '@/components/heatmap'
import { TaskManager } from '@/components/taskmanager'
import { Stats } from '@/components/stats'

interface HeatmapData {
  date: string
  count: number
  completed: boolean
}

export default function Home() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([])
  const [stats, setStats] = useState({
    totalDays: 0,
    completedDays: 0,
    currentStreak: 0,
    longestStreak: 0
  })

  useEffect(() => {
    fetchHeatmapData()
  }, [])

  const fetchHeatmapData = async () => {
    try {
      const response = await fetch('/api/heatmap')
      if (response.ok) {
        const data = await response.json()
        setHeatmapData(data)
        calculateStats(data)
      }
    } catch (error) {
      console.error('Error fetching heatmap data:', error)
    }
  }

  const calculateStats = (data: HeatmapData[]) => {
    const completedDays = data.filter(d => d.completed).length
    const totalDays = data.filter(d => d.count > 0).length
    
    // Calculate streaks
    const sortedData = [...data].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 0
    
    // Calculate current streak from today backwards
    for (const item of sortedData) {
      if (item.completed) {
        currentStreak++
      } else {
        break
      }
    }
    
    // Calculate longest streak
    for (const item of sortedData.reverse()) {
      if (item.completed) {
        tempStreak++
        longestStreak = Math.max(longestStreak, tempStreak)
      } else {
        tempStreak = 0
      }
    }
    
    setStats({ totalDays, completedDays, currentStreak, longestStreak })
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
  }

  return (
    <div className="container mx-auto p-6 space-y-8 max-w-7xl">
      {/* Header */}
      <div className="text-center space-y-4 animate-fade-in">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <Target className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
            Daily Task Tracker
          </h1>
          <div className="p-3 bg-primary/10 rounded-full">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
        </div>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Track your daily progress with a beautiful GitHub-style heatmap visualization. 
          Build habits, complete tasks, and watch your productivity grow over time.
        </p>
      </div>

      {/* Stats Cards */}
      <Stats {...stats} />

      {/* Heatmap */}
      <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
        <Heatmap data={heatmapData} onDateClick={handleDateClick} />
      </div>

      {/* Task Manager */}
      <div className="flex justify-center animate-fade-in" style={{ animationDelay: '400ms' }}>
        <TaskManager 
          selectedDate={selectedDate} 
          onTasksChange={fetchHeatmapData}
        />
      </div>

      {/* Footer */}
      <div className="text-center text-muted-foreground text-sm py-8">
        <p>Built with Next.js 15, Prisma, PostgreSQL, and shadcn/ui</p>
      </div>
    </div>
  )
}

