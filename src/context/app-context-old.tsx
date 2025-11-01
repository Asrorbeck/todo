"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface Project {
  id: number
  name: string
  description: string
  createdAt: string
  lastActivity: string
  color: string
}

interface Task {
  id: number
  title: string
  description: string
  status: string
  projectId: number
  createdAt: string
  dueDate: string | null
  activityLog: Array<{ action: string; timestamp: string }>
}

interface AppContextType {
  theme: string
  toggleTheme: () => void
  projects: Project[]
  addProject: (project: Omit<Project, "id" | "createdAt" | "lastActivity">) => Project
  updateProject: (id: number, updates: Partial<Project>) => void
  deleteProject: (id: number) => void
  tasks: Task[]
  addTask: (task: Omit<Task, "id" | "createdAt" | "activityLog">) => Task
  updateTask: (id: number, updates: Partial<Task>) => void
  deleteTask: (id: number) => void
  getProjectTasks: (projectId: number) => Task[]
  getTasksByStatus: (projectId: number, status: string) => Task[]
  currentPage: string
  setCurrentPage: (page: string) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  getFilteredProjects: () => Project[]
  getFilteredTasks: () => Task[]
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState("light")
  const [projects, setProjects] = useState<Project[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [currentPage, setCurrentPage] = useState("projects")
  const [searchQuery, setSearchQuery] = useState("")

  // Load data from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light"
    setTheme(savedTheme)
    document.documentElement.classList.toggle("dark", savedTheme === "dark")

    const savedProjects = localStorage.getItem("projects")
    const savedTasks = localStorage.getItem("tasks")

    if (savedProjects) setProjects(JSON.parse(savedProjects))
    if (savedTasks) setTasks(JSON.parse(savedTasks))
  }, [])

  // Save projects to localStorage
  useEffect(() => {
    localStorage.setItem("projects", JSON.stringify(projects))
  }, [projects])

  // Save tasks to localStorage
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks))
  }, [tasks])

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
    document.documentElement.classList.toggle("dark", newTheme === "dark")
  }

  const addProject = (project: Omit<Project, "id" | "createdAt" | "lastActivity">) => {
    const newProject: Project = {
      id: Date.now(),
      name: project.name,
      description: project.description || "",
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      color: project.color || "#3B82F6",
    }
    setProjects([...projects, newProject])
    return newProject
  }

  const updateProject = (id: number, updates: Partial<Project>) => {
    setProjects(projects.map((p) => (p.id === id ? { ...p, ...updates } : p)))
  }

  const deleteProject = (id: number) => {
    setProjects(projects.filter((p) => p.id !== id))
    setTasks(tasks.filter((t) => t.projectId !== id))
  }

  const addTask = (task: Omit<Task, "id" | "createdAt" | "activityLog">) => {
    const newTask: Task = {
      id: Date.now(),
      title: task.title,
      description: task.description || "",
      status: task.status || "todo",
      projectId: task.projectId,
      createdAt: new Date().toISOString(),
      dueDate: task.dueDate || null,
      activityLog: [{ action: "created", timestamp: new Date().toISOString() }],
    }
    setTasks([...tasks, newTask])
    updateProject(task.projectId, { lastActivity: new Date().toISOString() })
    return newTask
  }

  const updateTask = (id: number, updates: Partial<Task>) => {
    setTasks(
      tasks.map((t) => {
        if (t.id === id) {
          const oldStatus = t.status
          const newTask = { ...t, ...updates }

          const activityLog = [...(t.activityLog || [])]

          if (oldStatus !== updates.status && updates.status) {
            activityLog.push({
              action: `status changed from ${oldStatus} to ${updates.status}`,
              timestamp: new Date().toISOString(),
            })
          }

          if (updates.title && updates.title !== t.title) {
            activityLog.push({
              action: `title changed to "${updates.title}"`,
              timestamp: new Date().toISOString(),
            })
          }

          if (updates.dueDate && updates.dueDate !== t.dueDate) {
            activityLog.push({
              action: `due date changed to ${new Date(updates.dueDate).toLocaleDateString()}`,
              timestamp: new Date().toISOString(),
            })
          }

          newTask.activityLog = activityLog

          return newTask
        }
        return t
      }),
    )
  }

  const deleteTask = (id: number) => {
    setTasks(tasks.filter((t) => t.id !== id))
  }

  const getProjectTasks = (projectId: number) => {
    return tasks.filter((t) => t.projectId === projectId)
  }

  const getTasksByStatus = (projectId: number, status: string) => {
    return getProjectTasks(projectId).filter((t) => t.status === status)
  }

  const getFilteredProjects = () => {
    return projects.filter(
      (p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }

  const getFilteredTasks = () => {
    return tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        projects,
        addProject,
        updateProject,
        deleteProject,
        tasks,
        addTask,
        updateTask,
        deleteTask,
        getProjectTasks,
        getTasksByStatus,
        currentPage,
        setCurrentPage,
        searchQuery,
        setSearchQuery,
        getFilteredProjects,
        getFilteredTasks,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useApp must be used within AppProvider")
  }
  return context
}
