import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const date = searchParams.get('date')
    
    if (!date) {
      return NextResponse.json({ error: 'Date parameter is required' }, { status: 400 })
    }

    const entry = await prisma.taskEntry.findUnique({
      where: { date: new Date(date) },
      include: { 
        tasks: {
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    return NextResponse.json({ 
      tasks: entry?.tasks || [],
      completed: entry?.completed || false
    })
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, description, date } = await request.json()
    
    if (!title || !date) {
      return NextResponse.json({ error: 'Title and date are required' }, { status: 400 })
    }

    // Find or create task entry for the date
    let entry = await prisma.taskEntry.findUnique({
      where: { date: new Date(date) }
    })

    if (!entry) {
      entry = await prisma.taskEntry.create({
        data: { date: new Date(date) }
      })
    }

    // Create the task
    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        entryId: entry.id
      }
    })

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
