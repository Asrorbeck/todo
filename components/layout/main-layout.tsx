"use client"

import { useApp } from "@/context/app-context"
import { Sidebar } from "./sidebar"
import { Navbar } from "./navbar"
import { ProjectsPage } from "@/pages/projects-page"
import { KanbanPage } from "@/pages/kanban-page"
import { CalendarPage } from "@/pages/calendar-page"
import { AnalyticsPage } from "@/pages/analytics-page"

export function MainLayout() {
  const { currentPage } = useApp()

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-auto">
          {currentPage === "projects" && <ProjectsPage />}
          {currentPage === "kanban" && <KanbanPage />}
          {currentPage === "calendar" && <CalendarPage />}
          {currentPage === "analytics" && <AnalyticsPage />}
        </main>
      </div>
    </div>
  )
}
