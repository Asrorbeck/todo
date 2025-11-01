"use client"

import { Button } from "@/components/ui/button"
import { KanbanTaskCard } from "./kanban-task-card"
import { Icons } from "@/lib/icons"
import { useState } from "react"
import { AddTaskDialog } from "@/components/dialogs/add-task-dialog"

export function KanbanColumn({ status, label, tasks, projectId, onDragStart, onDragOver, onDrop, draggedTask }: any) {
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">{label}</h3>
        <span className="text-sm text-muted-foreground bg-secondary px-2 py-1 rounded">{tasks.length}</span>
      </div>

      <div
        className="bg-secondary/50 rounded-lg p-4 min-h-96 space-y-3 transition-colors"
        onDragOver={onDragOver}
        onDrop={onDrop}
        style={{
          backgroundColor: draggedTask && draggedTask.status !== status ? "rgba(var(--color-primary), 0.1)" : "",
        }}
      >
        {tasks.map((task: any) => (
          <KanbanTaskCard
            key={task.id}
            task={task}
            onDragStart={onDragStart}
            isDragging={draggedTask?.id === task.id}
          />
        ))}

        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-foreground"
          onClick={() => setIsAddTaskOpen(true)}
        >
          <Icons.plus className="h-4 w-4 mr-2" />
          Add task
        </Button>
      </div>

      <AddTaskDialog
        open={isAddTaskOpen}
        onOpenChange={setIsAddTaskOpen}
        defaultProjectId={projectId}
        defaultStatus={status}
      />
    </div>
  )
}
