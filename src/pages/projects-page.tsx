"use client"

import { useApp } from "@/context/app-context"
import { Button } from "@/components/ui/button"
import { ProjectCard } from "@/components/cards/project-card"
import { AddProjectDialog } from "@/components/dialogs/add-project-dialog"
import { useState } from "react"
import { Icons } from "@/lib/icons"

export function ProjectsPage() {
  const { projects, searchQuery } = useApp()
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false)

  const filteredProjects = projects.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Projects</h1>
          <p className="text-muted-foreground">Manage all your projects and tasks</p>
        </div>
        <Button onClick={() => setIsAddProjectOpen(true)} className="gap-2">
          <Icons.plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-4">No projects yet</p>
          <Button onClick={() => setIsAddProjectOpen(true)}>Create your first project</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      <AddProjectDialog open={isAddProjectOpen} onOpenChange={setIsAddProjectOpen} />
    </div>
  )
}
