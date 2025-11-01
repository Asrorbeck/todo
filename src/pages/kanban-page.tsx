"use client"

import { useApp } from "@/context/app-context"
import { useParams, useNavigate } from "react-router-dom"
import { KanbanBoard } from "@/components/kanban/kanban-board"

export function KanbanPage() {
  const { projects } = useApp()
  const { id } = useParams()
  const navigate = useNavigate()
  const projectId = id ? Number(id) : null

  if (!projectId) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Create a project to view the Kanban board</p>
      </div>
    )
  }

  const project = projects.find((p) => p.id === projectId)
  
  if (!project) {
    navigate("/projects")
    return null
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-2">{project.name}</h1>
        <p className="text-muted-foreground">{project.description}</p>
      </div>
      <KanbanBoard projectId={projectId} />
    </div>
  )
}
