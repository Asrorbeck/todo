"use client"

import { useApp } from "@/context/app-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Icons } from "@/lib/icons"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { EditProjectDialog } from "@/components/dialogs/edit-project-dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function ProjectCard({ project }: any) {
  const { getProjectTasks, deleteProject } = useApp()
  const tasks = getProjectTasks(project.id)
  const completedTasks = tasks.filter((t) => t.status === "done").length
  const navigate = useNavigate()
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold mb-1">{project.name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsEditDialogOpen(true)}
          >
            <Icons.edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Icons.trash className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-semibold">
            {tasks.length === 0 ? "0" : Math.round((completedTasks / tasks.length) * 100)}%
          </span>
        </div>
        <div className="w-full bg-secondary rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all"
            style={{ width: `${tasks.length === 0 ? 0 : (completedTasks / tasks.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{tasks.length} tasks</span>
        <Button variant="outline" size="sm" onClick={() => navigate(`/projects/${project.id}`)}>
          View
        </Button>
      </div>

      <EditProjectDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        project={project}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the project "{project.name}" and all its tasks.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                deleteProject(project.id)
                setIsDeleteDialogOpen(false)
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
