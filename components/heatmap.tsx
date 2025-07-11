"use client"

import { useState, useMemo, useCallback } from 'react'
import CalendarHeatmap from 'react-calendar-heatmap'
import { format, subDays } from 'date-fns'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface HeatmapData {
  date: string
  count: number
  completed: boolean
}

interface TransformedData {
  date: string
  count: number
  original: HeatmapData
}

interface HeatmapProps {
  data: HeatmapData[]
  onDateClick?: (date: Date) => void
  showTitle?: boolean
  className?: string
}

const ACTIVITY_LEVELS = [
  { level: 0, label: 'No activity', bgClass: 'bg-slate-200 dark:bg-slate-800', description: 'No tasks' },
  { level: 1, label: '1 task', bgClass: 'bg-emerald-200 dark:bg-emerald-900', description: 'Light activity' },
  { level: 2, label: '2 tasks', bgClass: 'bg-emerald-300 dark:bg-emerald-700', description: 'Moderate activity' },
  { level: 3, label: '3+ tasks', bgClass: 'bg-emerald-400 dark:bg-emerald-500', description: 'High activity' },
  { level: 4, label: 'Completed tasks', bgClass: 'bg-emerald-500 dark:bg-emerald-400', description: 'Perfect day' }
] as const

export function Heatmap({ 
  data, 
  onDateClick, 
  showTitle = true, 
  className = '' 
}: HeatmapProps) {
  const [hoveredData, setHoveredData] = useState<HeatmapData | null>(null)
  const [isHovering, setIsHovering] = useState(false)
  
  const dateRange = useMemo(() => {
    const endDate = new Date()
    const startDate = subDays(endDate, 365)
    return { startDate, endDate }
  }, [])

  const transformedData = useMemo(() => 
    data.map(item => ({
      date: item.date,
      count: item.completed ? 4 : Math.min(Math.max(item.count, 0), 3),
      original: item
    })), [data]
  )

  const stats = useMemo(() => {
    const totalDays = data.filter(d => d.count > 0).length
    const completedDays = data.filter(d => d.completed).length
    const currentYear = new Date().getFullYear()
    const thisYearData = data.filter(d => new Date(d.date).getFullYear() === currentYear)
    const thisYearActive = thisYearData.filter(d => d.count > 0).length
    
    return { totalDays, completedDays, thisYearActive }
  }, [data])

  const getClassForValue = useCallback((value: TransformedData | null): string => {
    if (!value || value.count === 0) {
      return 'color-github-0'
    }
    return `color-github-${Math.min(value.count, 4)}`
  }, [])

  const getTitleForValue = useCallback((value: TransformedData | null): string => {
    if (!value?.date) return ''
    
    const date = format(new Date(value.date), 'MMM d, yyyy')
    const { count, original } = value
    
    if (!count) {
      return `No tasks on ${date}`
    }
    
    const taskText = original.count === 1 ? 'task' : 'tasks'
    const completedText = original?.completed ? ' ✅ All completed!' : ''
    
    return `${original.count} ${taskText} on ${date}${completedText}`
  }, [])

  const handleDateClick = useCallback((value: TransformedData | null) => {
    if (value?.date && onDateClick) {
      onDateClick(new Date(value.date))
    }
  }, [onDateClick])

  const handleMouseOver = useCallback((event: React.MouseEvent, value: TransformedData | null) => {
    setHoveredData(value?.original || null)
    setIsHovering(true)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setHoveredData(null)
    setIsHovering(false)
  }, [])

  return (
    <div 
      className={`w-full space-y-4 ${className}`}
      role="region" 
      aria-label="Task Activity Heatmap"
    >
      {showTitle && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Activity Overview
              </h3>
              <p className="text-sm text-muted-foreground">
                Your daily task completion over the past year
              </p>
            </div>
            
            {/* Quick stats */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>{stats.thisYearActive} active days</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                <span>{stats.completedDays} perfect days</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <TooltipProvider>
        <div className="relative">
          {/* Heatmap container with enhanced styling */}
          <div className="min-w-[750px] w-full p-4 bg-card/30 rounded-lg border border-border/50 overflow-x-auto">
            <CalendarHeatmap
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
              values={transformedData}
              classForValue={getClassForValue}
              titleForValue={getTitleForValue}
              onClick={handleDateClick}
              onMouseOver={handleMouseOver}
              onMouseLeave={handleMouseLeave}
              showWeekdayLabels={true}
              showMonthLabels={true}
              gutterSize={3}
            />
          </div>
          
          {/* Enhanced hover tooltip */}
          {isHovering && hoveredData && (
            <div className="absolute top-4 right-4 z-10 p-3 bg-popover border border-border rounded-lg shadow-lg animate-fade-in">
              <div className="text-sm space-y-1">
                <div className="font-medium">
                  {format(new Date(hoveredData.date), 'EEEE, MMM d, yyyy')}
                </div>
                <div className="text-muted-foreground">
                  {hoveredData.count === 0 ? 'No tasks' : 
                   `${hoveredData.count} task${hoveredData.count !== 1 ? 's' : ''}`}
                  {hoveredData.completed && hoveredData.count > 0 && (
                    <span className="text-emerald-400 ml-1">✅ Completed</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </TooltipProvider>
      
      {/* Enhanced legend */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>Less</span>
          <div className="flex gap-1" role="legend" aria-label="Activity level legend">
            {ACTIVITY_LEVELS.map(({ level, label, bgClass, description }) => (
              <Tooltip key={level}>
                <TooltipTrigger asChild>
                  <div 
                    className={`w-3 h-3 rounded-sm cursor-help transition-transform hover:scale-125 ${bgClass}`}
                    role="presentation"
                    aria-label={`Activity level ${level}: ${label}`}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-center">
                    <p className="font-medium">{label}</p>
                    <p className="text-xs text-muted-foreground">{description}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
          <span>More</span>
        </div>
        
        {/* Additional info */}
        <div className="text-xs text-muted-foreground">
          Click any day to view or add tasks
        </div>
      </div>
    </div>
  )
}