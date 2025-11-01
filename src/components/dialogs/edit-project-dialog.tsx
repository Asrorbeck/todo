"use client"

import { useApp } from "@/context/app-context"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

export function EditProjectDialog({ open, onOpenChange, project }: any) {
  const { updateProject } = useApp()
  const { toast } = useToast()
  const [formData, setFormData] = useState({ name: "", description: "" })

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || "",
        description: project.description || "",
      })
    }
  }, [project])

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Project name is required",
        variant: "destructive",
      })
      return
    }

    updateProject(project.id, formData)
    toast({
      title: "Success",
      description: "Project updated successfully",
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Project Name</label>
            <Input
              placeholder="Enter project name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea
              placeholder="Enter project description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Update Project</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

