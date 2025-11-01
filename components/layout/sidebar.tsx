"use client"

import { useApp } from "@/context/app-context"
import { Button } from "@/components/ui/button"
import { Icons } from "@/lib/icons"

export function Sidebar() {
  const { currentPage, setCurrentPage } = useApp()

  const navItems = [
    { id: "projects", label: "Projects", icon: Icons.layoutGrid },
    { id: "kanban", label: "Kanban", icon: Icons.layoutGrid },
    { id: "calendar", label: "Calendar", icon: Icons.calendar },
    { id: "analytics", label: "Analytics", icon: Icons.barChart },
  ]

  return (
    <aside className="w-64 border-r border-border bg-sidebar flex flex-col">
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-2xl font-bold text-sidebar-foreground">TaskFlow</h1>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <Button
              key={item.id}
              variant={currentPage === item.id ? "default" : "ghost"}
              className="w-full justify-start gap-2"
              onClick={() => setCurrentPage(item.id)}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Button>
          )
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <div className="text-sm text-sidebar-foreground/60">TaskFlow Manager</div>
      </div>
    </aside>
  )
}
