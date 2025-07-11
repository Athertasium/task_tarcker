"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Target, TrendingUp, Calendar, Flame, Trophy, Zap } from 'lucide-react'

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
      bgColor: 'bg-blue-950/30',
      borderColor: 'border-blue-800/30',
      glowColor: 'shadow-blue-500/10',
      description: 'Days with tasks'
    },
    {
      title: 'Completed Days',
      value: completedDays,
      icon: Target,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-950/30',
      borderColor: 'border-emerald-800/30',
      glowColor: 'shadow-emerald-500/10',
      description: 'Perfect days'
    },
    {
      title: 'Current Streak',
      value: currentStreak,
      icon: currentStreak > 0 ? Flame : Zap,
      color: currentStreak > 0 ? 'text-orange-400' : 'text-gray-400',
      bgColor: currentStreak > 0 ? 'bg-orange-950/30' : 'bg-gray-950/30',
      borderColor: currentStreak > 0 ? 'border-orange-800/30' : 'border-gray-800/30',
      glowColor: currentStreak > 0 ? 'shadow-orange-500/10' : 'shadow-gray-500/10',
      description: 'Days in a row'
    },
    {
      title: 'Best Streak',
      value: longestStreak,
      icon: Trophy,
      color: 'text-purple-400',
      bgColor: 'bg-purple-950/30',
      borderColor: 'border-purple-800/30',
      glowColor: 'shadow-purple-500/10',
      description: 'Personal record'
    }
  ]

  const getStreakMessage = () => {
    if (currentStreak === 0) return "Start your streak today!"
    if (currentStreak === 1) return "Great start! Keep it going!"
    if (currentStreak < 7) return "Building momentum!"
    if (currentStreak < 30) return "You're on fire! 🔥"
    return "Incredible dedication! 🏆"
  }

  const getCompletionMessage = () => {
    if (completionRate === 0) return "Ready to begin your journey?"
    if (completionRate < 25) return "Every expert was once a beginner"
    if (completionRate < 50) return "You're making progress!"
    if (completionRate < 75) return "Consistency is key!"
    if (completionRate < 90) return "Almost there, champion!"
    return "Productivity master! 🎯"
  }

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, index) => (
          <Card 
            key={stat.title} 
            className={`
              ${stat.bgColor} ${stat.borderColor} ${stat.glowColor}
              glass card-shadow hover:card-shadow-hover
              transition-all duration-300 hover:scale-105
              animate-fade-in group cursor-pointer
            `} 
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <div className="space-y-1">
                <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                  {stat.title}
                </CardTitle>
                <p className="text-xs text-muted-foreground/70">
                  {stat.description}
                </p>
              </div>
              <div className={`p-2 rounded-lg ${stat.bgColor} border ${stat.borderColor} group-hover:scale-110 transition-transform`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-baseline gap-2">
                <div className={`text-2xl sm:text-3xl font-bold ${stat.color} group-hover:scale-105 transition-transform`}>
                  {stat.value}
                </div>
                {stat.title === 'Current Streak' && currentStreak > 0 && (
                  <div className="flex">
                    {[...Array(Math.min(currentStreak, 5))].map((_, i) => (
                      <div
                        key={i}
                        className="w-1 h-1 bg-orange-400 rounded-full animate-pulse-subtle"
                        style={{ animationDelay: `${i * 200}ms` }}
                      />
                    ))}
                  </div>
                )}
              </div>
              
              {stat.title === 'Completed Days' && totalDays > 0 && (
                <div className="space-y-2">
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${
                      completionRate >= 80 ? 'bg-emerald-950/50 text-emerald-400 border-emerald-800/30' :
                      completionRate >= 60 ? 'bg-blue-950/50 text-blue-400 border-blue-800/30' :
                      completionRate >= 40 ? 'bg-yellow-950/50 text-yellow-400 border-yellow-800/30' :
                      'bg-gray-950/50 text-gray-400 border-gray-800/30'
                    }`}
                  >
                    {completionRate}% completion rate
                  </Badge>
                  <div className="w-full bg-muted/20 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${
                        completionRate >= 80 ? 'bg-emerald-400' :
                        completionRate >= 60 ? 'bg-blue-400' :
                        completionRate >= 40 ? 'bg-yellow-400' :
                        'bg-gray-400'
                      }`}
                      style={{ 
                        width: `${completionRate}%`,
                        animationDelay: `${index * 100 + 500}ms`
                      }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Motivational Messages */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in" style={{ animationDelay: '600ms' }}>
        {/* Streak Message */}
        <Card className="glass card-shadow border-orange-800/20 bg-orange-950/20">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-950/50 rounded-lg border border-orange-800/30">
                <Flame className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <h3 className="font-semibold text-orange-400">Streak Status</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {getStreakMessage()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Completion Message */}
        <Card className="glass card-shadow border-emerald-800/20 bg-emerald-950/20">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-950/50 rounded-lg border border-emerald-800/30">
                <Target className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-semibold text-emerald-400">Progress Update</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {getCompletionMessage()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}