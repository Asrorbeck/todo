"use client"

import { useApp } from "@/context/app-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Icons } from "@/lib/icons"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function ProjectCard({ project }) {
  const { getProjectTasks, deleteProject, setCurrentPage } = useApp()
  const tasks = getProjectTasks(project.id)
  const completedTasks = tasks.filter((t) => t.status === "done").length

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold mb-1">{project.name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
              <Icons.moreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => deleteProject(project.id)} className="text-destructive">
              <Icons.trash className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
        <Button variant="outline" size="sm" onClick={() => setCurrentPage("kanban")}>
          View
        </Button>
      </div>
    </Card>
  )
}
