"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useApp } from "@/context/app-context"
import { useState } from "react"
import { EditTaskDialog } from "./edit-task-dialog"

export function TaskDetailsDialog({ open, onOpenChange, taskId }: any) {
  const { tasks, projects, deleteTask } = useApp()
  const [isEditOpen, setIsEditOpen] = useState(false)

  const task = tasks.find((t) => t.id === Number(taskId))
  const project = task ? projects.find((p) => p.id === task.projectId) : null

  if (!task) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case "done":
        return "bg-green-100 text-green-800"
      case "inprogress":
        return "bg-blue-100 text-blue-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getActionDescription = (action: string) => {
    return action.charAt(0).toUpperCase() + action.slice(1)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Task Details</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-3">{task.title}</h3>
              <div className="flex items-center gap-4 flex-wrap">
                <Badge className={getStatusColor(task.status)}>
                  {task.status === "inprogress"
                    ? "In Progress"
                    : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                </Badge>
                {project && <span className="text-sm text-muted-foreground">{project.name}</span>}
                {task.dueDate && (
                  <span className="text-sm text-muted-foreground">
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>

            {task.description && (
              <div>
                <h4 className="font-semibold mb-2 text-sm">Description</h4>
                <p className="text-sm text-muted-foreground">{task.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-1 text-sm">Created</h4>
                <p className="text-sm text-muted-foreground">
                  {new Date(task.createdAt).toLocaleDateString()} {new Date(task.createdAt).toLocaleTimeString()}
                </p>
              </div>
              {task.dueDate && (
                <div>
                  <h4 className="font-semibold mb-1 text-sm">Due Date</h4>
                  <p className="text-sm text-muted-foreground">{new Date(task.dueDate).toLocaleDateString()}</p>
                </div>
              )}
            </div>

            <div>
              <h4 className="font-semibold mb-3 text-sm">Activity Log</h4>
              <div className="space-y-2 max-h-64 overflow-auto">
                {task.activityLog && task.activityLog.length > 0 ? (
                  task.activityLog
                    .slice()
                    .reverse()
                    .map((log: any, idx: number) => (
                      <div key={idx} className="flex items-start gap-3 pb-2 border-b border-border last:border-0">
                        <div className="text-xs text-muted-foreground min-w-fit pt-1">
                          {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString()}
                        </div>
                        <div className="text-sm text-muted-foreground">{getActionDescription(log.action)}</div>
                      </div>
                    ))
                ) : (
                  <p className="text-xs text-muted-foreground">No activity yet</p>
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-border">
              <Button variant="outline" onClick={() => setIsEditOpen(true)}>
                Edit Task
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  deleteTask(task.id)
                  onOpenChange(false)
                }}
              >
                Delete Task
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <EditTaskDialog open={isEditOpen} onOpenChange={setIsEditOpen} task={task} />
    </>
  )
}
