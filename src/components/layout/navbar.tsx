"use client"

import { useApp } from "@/context/app-context"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Icons } from "@/lib/icons"
import { useState, useMemo, useEffect, useRef } from "react"
import { AddTaskDialog } from "@/components/dialogs/add-task-dialog"
import { useNavigate } from "react-router-dom"

export function Navbar() {
  const { theme, toggleTheme, searchQuery, setSearchQuery, tasks, projects } = useApp()
  const { signOut, user } = useAuth()
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const navigate = useNavigate()
  const notificationsRef = useRef<HTMLDivElement>(null)
  
  const overdueTasks = useMemo(() => {
    const now = new Date()
    return tasks.filter((t) => {
      if (!t.dueDate || t.status === "done") return false
      return new Date(t.dueDate) < now
    })
  }, [tasks])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
    }

    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showNotifications])

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
                        <div
                          key={project.id}
                          className="px-3 py-2 hover:bg-secondary cursor-pointer rounded text-sm"
                          onClick={() => {
                            navigate(`/projects/${project.id}`)
                            setSearchQuery("")
                            setShowResults(false)
                          }}
                        >
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
                          <div
                            key={task.id}
                            className="px-3 py-2 hover:bg-secondary cursor-pointer rounded text-sm"
                            onClick={() => {
                              navigate(`/projects/${task.projectId}`)
                              setSearchQuery("")
                              setShowResults(false)
                            }}
                          >
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
        {overdueTasks.length > 0 && (
          <div className="relative" ref={notificationsRef}>
            <Button 
              size="icon" 
              variant="outline" 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative"
            >
              <Icons.bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 bg-destructive text-white text-xs font-bold rounded-full min-h-5 min-w-5 px-1 flex items-center justify-center">
                {overdueTasks.length}
              </span>
            </Button>
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-lg shadow-lg z-50">
                <div className="p-2 border-b border-border">
                  <div className="px-3 py-2 text-xs font-semibold text-muted-foreground">
                    Overdue Tasks ({overdueTasks.length})
                  </div>
                </div>
                <div className="max-h-96 overflow-auto">
                  {overdueTasks.map((task) => {
                    const project = projects.find((p) => p.id === task.projectId)
                    return (
                      <div
                        key={task.id}
                        className="px-3 py-2 hover:bg-secondary cursor-pointer border-b border-border last:border-b-0"
                        onClick={() => {
                          navigate(`/projects/${task.projectId}`)
                          setShowNotifications(false)
                        }}
                      >
                        <div className="font-medium text-sm">{task.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {project?.name}
                        </div>
                        <div className="text-xs text-destructive mt-1">
                          Due: {new Date(task.dueDate!).toLocaleDateString()}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}
        <Button size="icon" variant="outline" onClick={() => setIsAddTaskOpen(true)}>
          <Icons.plus className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="outline" onClick={toggleTheme}>
          {theme === "light" ? <Icons.moon className="h-4 w-4" /> : <Icons.sun className="h-4 w-4" />}
        </Button>
        <Button size="icon" variant="outline" onClick={() => signOut()}>
          <Icons.logOut className="h-4 w-4" />
        </Button>
      </div>

      <AddTaskDialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen} />
    </nav>
  )
}
