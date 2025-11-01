"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "./auth-context"

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
  addProject: (project: Omit<Project, "id" | "createdAt" | "lastActivity">) => Promise<Project>
  updateProject: (id: number, updates: Partial<Project>) => Promise<void>
  deleteProject: (id: number) => Promise<void>
  tasks: Task[]
  addTask: (task: Omit<Task, "id" | "createdAt" | "activityLog">) => Promise<Task>
  updateTask: (id: number, updates: Partial<Task>) => Promise<void>
  deleteTask: (id: number) => Promise<void>
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
  const { user } = useAuth()

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light"
    setTheme(savedTheme)
    document.documentElement.classList.toggle("dark", savedTheme === "dark")
  }, [])

  // Load data from Supabase
  useEffect(() => {
    if (user) {
      loadData()
    } else {
      setProjects([])
      setTasks([])
    }
  }, [user])

  const loadData = async () => {
    if (!user) return

    try {
      // Load projects (todos)
      const { data: todosData, error: todosError } = await supabase
        .from("todos")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (todosError) throw todosError
      
      const loadedProjects = todosData.map((todo: any) => ({
        id: todo.id,
        name: todo.name,
        description: todo.description || "",
        createdAt: todo.created_at,
        lastActivity: todo.last_activity,
        color: todo.color || "#3B82F6",
      }))
      setProjects(loadedProjects)

      // Load tasks (todo_items)
      const { data: itemsData, error: itemsError } = await supabase
        .from("todo_items")
        .select("*")
        .in("todo_id", todosData.map((t: any) => t.id))
        .order("created_at", { ascending: false })

      if (itemsError) throw itemsError

      const loadedTasks = itemsData.map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description || "",
        status: item.status,
        projectId: item.todo_id,
        createdAt: item.created_at,
        dueDate: item.due_date,
        activityLog: item.activity_log || [],
      }))
      setTasks(loadedTasks)
    } catch (error) {
      console.error("Error loading data:", error)
    }
  }

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
    document.documentElement.classList.toggle("dark", newTheme === "dark")
  }

  const addProject = async (project: Omit<Project, "id" | "createdAt" | "lastActivity">) => {
    if (!user) throw new Error("User not authenticated")

    const now = new Date().toISOString()
    const { data, error } = await supabase
      .from("todos")
      .insert({
        name: project.name,
        description: project.description || "",
        color: project.color || "#3B82F6",
        created_at: now,
        last_activity: now,
        user_id: user.id,
      })
      .select()
      .single()

    if (error) throw error

    const newProject: Project = {
      id: data.id,
      name: data.name,
      description: data.description || "",
      createdAt: data.created_at,
      lastActivity: data.last_activity,
      color: data.color || "#3B82F6",
    }
    
    setProjects([newProject, ...projects])
    return newProject
  }

  const updateProject = async (id: number, updates: Partial<Project>) => {
    const updateData: any = {}
    if (updates.name) updateData.name = updates.name
    if (updates.description !== undefined) updateData.description = updates.description
    if (updates.color) updateData.color = updates.color
    updateData.last_activity = new Date().toISOString()

    const { error } = await supabase
      .from("todos")
      .update(updateData)
      .eq("id", id)

    if (error) throw error

    setProjects(projects.map((p) => (p.id === id ? { ...p, ...updates, lastActivity: updateData.last_activity } : p)))
  }

  const deleteProject = async (id: number) => {
    const { error } = await supabase
      .from("todos")
      .delete()
      .eq("id", id)

    if (error) throw error

    setProjects(projects.filter((p) => p.id !== id))
    setTasks(tasks.filter((t) => t.projectId !== id))
  }

  const addTask = async (task: Omit<Task, "id" | "createdAt" | "activityLog">) => {
    const now = new Date().toISOString()
    const { data, error } = await supabase
      .from("todo_items")
      .insert({
        todo_id: task.projectId,
        title: task.title,
        description: task.description || "",
        status: task.status || "todo",
        due_date: task.dueDate || null,
        created_at: now,
        activity_log: [{ action: "created", timestamp: now }],
      })
      .select()
      .single()

    if (error) throw error

    const newTask: Task = {
      id: data.id,
      title: data.title,
      description: data.description || "",
      status: data.status,
      projectId: data.todo_id,
      createdAt: data.created_at,
      dueDate: data.due_date,
      activityLog: data.activity_log || [],
    }

    setTasks([newTask, ...tasks])
    updateProject(task.projectId, { lastActivity: now })
    return newTask
  }

  const updateTask = async (id: number, updates: Partial<Task>) => {
    const task = tasks.find((t) => t.id === id)
    if (!task) return

    let activityLog = [...(task.activityLog || [])]
    const now = new Date().toISOString()

    if (updates.status && updates.status !== task.status) {
      activityLog.push({
        action: `status changed from ${task.status} to ${updates.status}`,
        timestamp: now,
      })
    }

    if (updates.title && updates.title !== task.title) {
      activityLog.push({
        action: `title changed to "${updates.title}"`,
        timestamp: now,
      })
    }

    if (updates.dueDate && updates.dueDate !== task.dueDate) {
      activityLog.push({
        action: `due date changed to ${new Date(updates.dueDate).toLocaleDateString()}`,
        timestamp: now,
      })
    }

    const updateData: any = {}
    if (updates.title) updateData.title = updates.title
    if (updates.description !== undefined) updateData.description = updates.description
    if (updates.status) updateData.status = updates.status
    if (updates.dueDate !== undefined) updateData.due_date = updates.dueDate
    updateData.activity_log = activityLog

    const { error } = await supabase
      .from("todo_items")
      .update(updateData)
      .eq("id", id)

    if (error) throw error

    setTasks(
      tasks.map((t) => {
        if (t.id === id) {
          return { ...t, ...updates, activityLog }
        }
        return t
      })
    )
  }

  const deleteTask = async (id: number) => {
    const { error } = await supabase
      .from("todo_items")
      .delete()
      .eq("id", id)

    if (error) throw error

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

