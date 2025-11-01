"use client"

import { useApp } from "@/context/app-context"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

export function AddProjectDialog({ open, onOpenChange }: any) {
  const { addProject } = useApp()
  const { toast } = useToast()
  const [formData, setFormData] = useState({ name: "", description: "" })

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Project name is required",
        variant: "destructive",
      })
      return
    }

    addProject(formData)
    toast({
      title: "Success",
      description: "Project created successfully",
    })
    setFormData({ name: "", description: "" })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
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
          <Button onClick={handleSubmit}>Create Project</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
