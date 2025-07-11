import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { startOfYear, endOfYear, format } from 'date-fns'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())
    
    const startDate = startOfYear(new Date(year, 0, 1))
    const endDate = endOfYear(new Date(year, 0, 1))

    const entries = await prisma.taskEntry.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        tasks: true
      },
      orderBy: {
        date: 'asc'
      }
    })

    const heatmapData = entries.map(entry => ({
      date: format(entry.date, 'yyyy-MM-dd'),
      count: entry.tasks.length,
      completed: entry.completed
    }))

    return NextResponse.json(heatmapData)
  } catch (error) {
    console.error('Error fetching heatmap data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
