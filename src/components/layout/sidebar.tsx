"use client"

import { Link, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Icons } from "@/lib/icons"

export function Sidebar() {
  const location = useLocation()

  const navItems = [
    { id: "projects", label: "Projects", icon: Icons.layoutGrid, path: "/projects" },
    { id: "calendar", label: "Calendar", icon: Icons.calendar, path: "/calendar" },
    { id: "analytics", label: "Analytics", icon: Icons.barChart, path: "/analytics" },
    { id: "finance", label: "Moliyaviy", icon: Icons.wallet, path: "/finance" },
  ]

  return (
    <aside className="w-64 border-r border-border bg-sidebar flex flex-col">
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-2xl font-bold text-sidebar-foreground">TaskFlow</h1>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          return (
            <Link key={item.id} to={item.path}>
              <Button
                variant={isActive ? "default" : "ghost"}
                className="w-full justify-start gap-2"
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <div className="text-sm text-sidebar-foreground/60">TaskFlow Manager</div>
      </div>
    </aside>
  )
}
