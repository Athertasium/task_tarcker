import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const id = await context.params.id
  if (!id) {
    return NextResponse.json(
      { error: 'Task ID is required' },
      { status: 400 }
    )
  }

  try {
    const body = await request.json()
    if (typeof body.completed !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }

    const task = await prisma.task.update({
      where: { id: id},
      data: { completed: body.completed }
    })

    // Update the entry's completed status
    const entry = await prisma.taskEntry.findUnique({
      where: { id: task.entryId },
      include: { tasks: true }
    })

    if (entry) {
      const allCompleted = entry.tasks.every(t => t.id === task.id ? body.completed : t.completed)
      await prisma.taskEntry.update({
        where: { id: entry.id },
        data: { completed: allCompleted && entry.tasks.length > 0 }
      })
    }

    return NextResponse.json(task)
  } catch (error) {
    console.error('Error updating task:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  if (!context.params.id) {
    return NextResponse.json(
      { error: 'Task ID is required' },
      { status: 400 }
    )
  }

  try {
    const task = await prisma.task.findUnique({
      where: { id: context.params.id },
      include: { entry: { include: { tasks: true } } }
    })

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    await prisma.task.delete({
      where: { id: context.params.id }
    })

    // Update entry completion status
    const remainingTasks = task.entry.tasks.filter(t => t.id !== context.params.id)
    const allCompleted = remainingTasks.length > 0 && remainingTasks.every(t => t.completed)
    
    await prisma.taskEntry.update({
      where: { id: task.entryId },
      data: { completed: allCompleted }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting task:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
