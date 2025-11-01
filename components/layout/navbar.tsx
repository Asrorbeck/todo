"use client"

import { useApp } from "@/context/app-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Icons } from "@/lib/icons"
import { useState, useMemo } from "react"
import { AddTaskDialog } from "@/components/dialogs/add-task-dialog"

export function Navbar() {
  const { theme, toggleTheme, searchQuery, setSearchQuery, tasks, projects } = useApp()
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const [showResults, setShowResults] = useState(false)

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return { projects: [], tasks: [] }

    const query = searchQuery.toLowerCase()
    return {
      projects: projects.filter(
        (p) => p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query),
      ),
      tasks: tasks.filter((t) => t.title.toLowerCase().includes(query) || t.description.toLowerCase().includes(query)),
    }
  }, [searchQuery, tasks, projects])

  const totalResults = searchResults.projects.length + searchResults.tasks.length

  return (
    <nav className="border-b border-border bg-card px-6 py-4 flex items-center justify-between">
      <div className="flex-1 flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Icons.search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search projects and tasks..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setShowResults(true)
            }}
            onFocus={() => searchQuery && setShowResults(true)}
            onBlur={() => setTimeout(() => setShowResults(false), 200)}
          />
          {showResults && searchQuery && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg max-h-96 overflow-auto z-50">
              {totalResults === 0 ? (
                <div className="p-4 text-center text-muted-foreground text-sm">No results found</div>
              ) : (
                <>
                  {searchResults.projects.length > 0 && (
                    <div className="p-2 border-b border-border">
                      <div className="px-3 py-2 text-xs font-semibold text-muted-foreground">Projects</div>
                      {searchResults.projects.map((project) => (
                        <div key={project.id} className="px-3 py-2 hover:bg-secondary cursor-pointer rounded text-sm">
                          <div className="font-medium">{project.name}</div>
                          <div className="text-xs text-muted-foreground line-clamp-1">{project.description}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {searchResults.tasks.length > 0 && (
                    <div className="p-2">
                      <div className="px-3 py-2 text-xs font-semibold text-muted-foreground">Tasks</div>
                      {searchResults.tasks.map((task) => {
                        const project = projects.find((p) => p.id === task.projectId)
                        return (
                          <div key={task.id} className="px-3 py-2 hover:bg-secondary cursor-pointer rounded text-sm">
                            <div className="font-medium">{task.title}</div>
                            <div className="text-xs text-muted-foreground">
                              {project?.name} • {task.status}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button size="icon" variant="outline" onClick={() => setIsAddTaskOpen(true)}>
          <Icons.plus className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="outline" onClick={toggleTheme}>
          {theme === "light" ? <Icons.moon className="h-4 w-4" /> : <Icons.sun className="h-4 w-4" />}
        </Button>
      </div>

      <AddTaskDialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen} />
    </nav>
  )
}
