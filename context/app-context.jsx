"use client"

import { createContext, useContext, useState, useEffect } from "react"

const AppContext = createContext()

export function AppProvider({ children }) {
  const [theme, setTheme] = useState("light")
  const [projects, setProjects] = useState([])
  const [tasks, setTasks] = useState([])
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

  const addProject = (project) => {
    const newProject = {
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

  const updateProject = (id, updates) => {
    setProjects(projects.map((p) => (p.id === id ? { ...p, ...updates } : p)))
  }

  const deleteProject = (id) => {
    setProjects(projects.filter((p) => p.id !== id))
    setTasks(tasks.filter((t) => t.projectId !== id))
  }

  const addTask = (task) => {
    const newTask = {
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

  const updateTask = (id, updates) => {
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

  const deleteTask = (id) => {
    setTasks(tasks.filter((t) => t.id !== id))
  }

  const getProjectTasks = (projectId) => {
    return tasks.filter((t) => t.projectId === projectId)
  }

  const getTasksByStatus = (projectId, status) => {
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
  return useContext(AppContext)
}
