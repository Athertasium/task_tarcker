"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Target, TrendingUp, Calendar, Flame } from 'lucide-react'

interface StatsProps {
  totalDays: number
  completedDays: number
  currentStreak: number
  longestStreak: number
}

export function Stats({ totalDays, completedDays, currentStreak, longestStreak }: StatsProps) {
  const completionRate = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0

  const stats = [
    {
      title: 'Total Active Days',
      value: totalDays,
      icon: Calendar,
      color: 'text-blue-400',
      bgColor: 'bg-blue-950/50',
      borderColor: 'border-blue-800/50'
    },
    {
      title: 'Completed Days',
      value: completedDays,
      icon: Target,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-950/50',
      borderColor: 'border-emerald-800/50'
    },
    {
      title: 'Current Streak',
      value: currentStreak,
      icon: Flame,
      color: 'text-orange-400',
      bgColor: 'bg-orange-950/50',
      borderColor: 'border-orange-800/50'
    },
    {
      title: 'Longest Streak',
      value: longestStreak,
      icon: TrendingUp,
      color: 'text-purple-400',
      bgColor: 'bg-purple-950/50',
      borderColor: 'border-purple-800/50'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={stat.title} className={`${stat.bgColor} ${stat.borderColor} animate-fade-in`} style={{ animationDelay: `${index * 100}ms` }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stat.value}</div>
            {stat.title === 'Completed Days' && totalDays > 0 && (
              <Badge variant="secondary" className="mt-2 text-xs">
                {completionRate}% completion rate
              </Badge>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
