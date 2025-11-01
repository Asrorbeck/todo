"use client"

import type React from "react"

import { useApp } from "@/context/app-context"
import { KanbanColumn } from "./kanban-column"
import { useState } from "react"

export function KanbanBoard({ projectId }: { projectId: string }) {
  const { getTasksByStatus, updateTask } = useApp()
  const [draggedTask, setDraggedTask] = useState<any>(null)

  const statuses = ["todo", "inprogress", "pending", "done"]
  const statusLabels = {
    todo: "To Do",
    inprogress: "In Progress",
    pending: "Pending",
    done: "Done",
  }

  const handleDragStart = (e: React.DragEvent, task: any) => {
    setDraggedTask(task)
    e.dataTransfer!.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer!.dropEffect = "move"
  }

  const handleDropOnColumn = (e: React.DragEvent, status: string) => {
    e.preventDefault()
    if (draggedTask && draggedTask.status !== status) {
      updateTask(draggedTask.id, { status })
    }
    setDraggedTask(null)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pb-8">
      {statuses.map((status) => (
        <KanbanColumn
          key={status}
          status={status}
          label={statusLabels[status as keyof typeof statusLabels]}
          tasks={getTasksByStatus(projectId, status)}
          projectId={projectId}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDropOnColumn(e, status)}
          draggedTask={draggedTask}
        />
      ))}
    </div>
  )
}
