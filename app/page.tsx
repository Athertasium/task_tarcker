"use client"

import { useState, useEffect } from 'react'
import { Calendar, Target, TrendingUp, Sparkles, Zap, Award } from 'lucide-react'
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
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchHeatmapData()
  }, [])

  const fetchHeatmapData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/heatmap')
      if (response.ok) {
        const data = await response.json()
        setHeatmapData(data)
        calculateStats(data)
      }
    } catch (error) {
      console.error('Error fetching heatmap data:', error)
    } finally {
      setIsLoading(false)
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

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground animate-pulse-subtle">Loading your productivity data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-bg">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative container mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8 max-w-7xl">
        {/* Enhanced Header */}
        <div className="text-center space-y-6 animate-fade-in">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl"></div>
              <div className="relative p-4 bg-primary/10 rounded-full border border-primary/20">
                <Target className="w-8 h-8 text-primary" />
              </div>
            </div>
            <div className="text-center">
              <h1 className="text-responsive-xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
                Daily Task Tracker
              </h1>
              <div className="flex items-center justify-center gap-2 mt-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-muted-foreground">Boost Your Productivity</span>
                <Zap className="w-4 h-4 text-yellow-400" />
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-accent/20 rounded-full blur-xl"></div>
              <div className="relative p-4 bg-accent/10 rounded-full border border-accent/20">
                <Sparkles className="w-8 h-8 text-accent" />
              </div>
            </div>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
              Transform your daily habits with our beautiful GitHub-style activity tracker. 
              Visualize your progress, build streaks, and achieve your goals with style.
            </p>
            
            {/* Quick stats preview */}
            <div className="flex items-center justify-center gap-6 mt-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse-subtle"></div>
                <span className="text-muted-foreground">
                  {stats.completedDays} days completed
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-yellow-400" />
                <span className="text-muted-foreground">
                  {stats.currentStreak} day streak
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
          <Stats {...stats} />
        </div>

        {/* Enhanced Heatmap */}
        <div className="animate-scale-in" style={{ animationDelay: '400ms' }}>
          <Card className="glass card-shadow hover:card-shadow-hover transition-all duration-300">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-semibold">
                      Activity Overview
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your productivity journey over the past year
                    </p>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Less</span>
                  <div className="flex gap-1">
                    {[0, 1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`w-3 h-3 rounded-sm ${
                          level === 0 ? 'bg-slate-800' :
                          level === 1 ? 'bg-emerald-900' :
                          level === 2 ? 'bg-emerald-700' :
                          level === 3 ? 'bg-emerald-500' :
                          'bg-emerald-400'
                        }`}
                      />
                    ))}
                  </div>
                  <span>More</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Heatmap 
                data={heatmapData} 
                onDateClick={handleDateClick}
                showTitle={false}
                className="border-0 bg-transparent p-0"
              />
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Task Manager */}
        <div className="flex justify-center animate-fade-in" style={{ animationDelay: '600ms' }}>
          <TaskManager 
            selectedDate={selectedDate} 
            onTasksChange={fetchHeatmapData}
          />
        </div>

        {/* Enhanced Footer */}
        <footer className="text-center py-8 animate-fade-in" style={{ animationDelay: '800ms' }}>
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <span>Built with</span>
              <div className="flex items-center gap-1">
                <span className="text-blue-400 font-medium">Next.js 15</span>
                <span>•</span>
                <span className="text-purple-400 font-medium">Prisma</span>
                <span>•</span>
                <span className="text-blue-500 font-medium">PostgreSQL</span>
                <span>•</span>
                <span className="text-gray-400 font-medium">shadcn/ui</span>
              </div>
            </div>
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-muted-foreground/30 to-transparent mx-auto"></div>
            <p className="text-xs text-muted-foreground/70">
              Track your progress, build habits, achieve greatness
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}