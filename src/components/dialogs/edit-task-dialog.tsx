"use client"

import { useApp } from "@/context/app-context"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

export function EditTaskDialog({ open, onOpenChange, task }: any) {
  const { updateTask } = useApp()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "todo",
    dueDate: "",
  })

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        status: task.status,
        dueDate: task.dueDate ? task.dueDate.split("T")[0] : "",
      })
    }
  }, [task, open])

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "Task title is required",
        variant: "destructive",
      })
      return
    }

    updateTask(task.id, formData)
    toast({
      title: "Success",
      description: "Task updated successfully",
    })
    onOpenChange(false)
  }

  if (!task) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Task Title</label>
            <Input
              placeholder="Enter task title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea
              placeholder="Enter task description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Status</label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="inprogress">In Progress</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="done">Done</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Due Date</label>
            <Input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Update Task</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
