"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Icons } from "@/lib/icons"
import { useApp } from "@/context/app-context"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useState } from "react"
import { EditTaskDialog } from "@/components/dialogs/edit-task-dialog"
import { TaskDetailsDialog } from "@/components/dialogs/task-details-dialog"

export function KanbanTaskCard({ task, onDragStart, isDragging }) {
  const { deleteTask } = useApp()
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  return (
    <>
      <Card
        draggable
        onDragStart={(e) => onDragStart(e, task)}
        onClick={() => setIsDetailsOpen(true)}
        className={`p-4 cursor-pointer hover:shadow-md transition-all bg-card group ${isDragging ? "opacity-50" : ""}`}
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <h4 className="font-medium text-sm flex-1 line-clamp-2">{task.title}</h4>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100"
                onClick={(e) => e.stopPropagation()}
              >
                <Icons.moreVertical className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                <span>Edit</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => deleteTask(task.id)} className="text-destructive">
                <Icons.trash className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {task.description && <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{task.description}</p>}
        {task.dueDate && (
          <div className="text-xs text-muted-foreground">Due: {new Date(task.dueDate).toLocaleDateString()}</div>
        )}
      </Card>
      <EditTaskDialog open={isEditOpen} onOpenChange={setIsEditOpen} task={task} />
      <TaskDetailsDialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen} taskId={task.id} />
    </>
  )
}
