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
  { level: 0, label: 'No activity', bgClass: 'bg-slate-200 dark:bg-slate-800' },
  { level: 1, label: '1 task', bgClass: 'bg-emerald-200 dark:bg-emerald-900' },
  { level: 2, label: '2 tasks', bgClass: 'bg-emerald-300 dark:bg-emerald-700' },
  { level: 3, label: '3+ tasks', bgClass: 'bg-emerald-400 dark:bg-emerald-500' },
  { level: 4, label: 'Completed tasks', bgClass: 'bg-emerald-500 dark:bg-emerald-400' }
] as const

export function Heatmap({ 
  data, 
  onDateClick, 
  showTitle = true, 
  className = '' 
}: HeatmapProps) {
  const [tooltipData, setTooltipData] = useState<HeatmapData | null>(null)
  
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

  const getClassForValue = useCallback((value: TransformedData | null): string => {
    if (!value || value.count === 0) {
      return 'color-github-0'
    }
    return `color-github-${Math.min(value.count, 4)}`
  }, [])

  const getTitleForValue = useCallback((value: TransformedData | null): string => {
    if (!value?.date) return ''
    
    const date = format(new Date(value.date), 'MMM d, yyyy')
    
    if (!value.count) {
      return `No tasks on ${date}`
    }
    
    const { count, original } = value
    const taskText = count === 1 ? 'task' : 'tasks'
    const completedText = original?.completed ? ' (Completed)' : ''
    
    return `${count} ${taskText}${completedText} on ${date}`
  }, [])

  const handleDateClick = useCallback((value: TransformedData | null) => {
    if (value?.date && onDateClick) {
      onDateClick(new Date(value.date))
    }
  }, [onDateClick])

  const handleMouseOver = useCallback((event: React.MouseEvent, value: TransformedData | null) => {
    setTooltipData(value?.original || null)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setTooltipData(null)
  }, [])

  return (
    <div 
      className={`w-full overflow-x-auto p-4 bg-card rounded-lg border ${className}`}
      role="region" 
      aria-label="Task Activity Heatmap"
    >
      {showTitle && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Activity Overview
          </h3>
          <p className="text-sm text-muted-foreground">
            Your daily task completion over the past year
          </p>
        </div>
      )}
      
      <TooltipProvider>
        <div className="min-w-[750px] w-full">
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
      </TooltipProvider>
      
      <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
        <span>Less</span>
        <div className="flex gap-1" role="legend" aria-label="Activity level legend">
          {ACTIVITY_LEVELS.map(({ level, label, bgClass }) => (
            <Tooltip key={level}>
              <TooltipTrigger asChild>
                <div 
                  className={`w-3 h-3 rounded-sm cursor-help ${bgClass}`}
                  role="presentation"
                  aria-label={`Activity level ${level}: ${label}`}
                />
              </TooltipTrigger>
              <TooltipContent>
                <p>{label}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
        <span>More</span>
      </div>

      {/* Optional: Display current tooltip data for debugging */}
      {process.env.NODE_ENV === 'development' && tooltipData && (
        <div className="mt-2 p-2 bg-muted rounded text-xs">
          <strong>Debug:</strong> {JSON.stringify(tooltipData, null, 2)}
        </div>
      )}
    </div>
  )
} 