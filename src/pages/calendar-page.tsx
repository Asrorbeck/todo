"use client"

import { useApp } from "@/context/app-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useMemo, useState } from "react"

export function CalendarPage() {
  const { tasks, projects } = useApp()
  const [currentDate, setCurrentDate] = useState(new Date())

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const getTasksForDate = (date: number) => {
    return tasks.filter((task) => {
      if (!task.dueDate) return false
      const taskDate = new Date(task.dueDate)
      return (
        taskDate.getDate() === date &&
        taskDate.getMonth() === currentDate.getMonth() &&
        taskDate.getFullYear() === currentDate.getFullYear()
      )
    })
  }

  const tasksByDate = useMemo(() => {
    const result: Record<number, typeof tasks> = {}
    for (let day = 1; day <= getDaysInMonth(currentDate); day++) {
      result[day] = getTasksForDate(day)
    }
    return result
  }, [currentDate, tasks])

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const daysInMonth = getDaysInMonth(currentDate)
  const firstDay = getFirstDayOfMonth(currentDate)

  const calendarDays = []
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null)
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day)
  }

  const upcomingTasks = tasks
    .filter((task) => task.dueDate)
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 5)

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Calendar & Timeline</h1>
        <p className="text-muted-foreground">View your tasks by date</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <Card className="p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-semibold">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handlePrevMonth}>
                  ← Previous
                </Button>
                <Button variant="outline" onClick={handleNextMonth}>
                  Next →
                </Button>
              </div>
            </div>

            {/* Day names header */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {dayNames.map((day) => (
                <div key={day} className="text-center font-semibold text-sm text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day, idx) => {
                const tasksForDay = day ? tasksByDate[day] : []
                const isCurrentDay =
                  day &&
                  day === new Date().getDate() &&
                  currentDate.getMonth() === new Date().getMonth() &&
                  currentDate.getFullYear() === new Date().getFullYear()

                return (
                  <div
                    key={idx}
                    className={`aspect-square rounded-lg border p-2 flex flex-col text-sm transition-colors ${
                      day
                        ? isCurrentDay
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card hover:bg-muted cursor-pointer border-border"
                        : "bg-muted/30 border-transparent"
                    }`}
                  >
                    {day && (
                      <>
                        <div className="font-semibold mb-1">{day}</div>
                        <div className="flex-1 overflow-hidden">
                          {tasksForDay.length > 0 && (
                            <div className="space-y-1">
                              {tasksForDay.slice(0, 2).map((task, i) => (
                                <div
                                  key={i}
                                  className={`text-xs p-1 rounded truncate font-medium ${
                                    task.status === "done"
                                      ? "bg-green-100 text-green-900"
                                      : task.status === "in-progress"
                                        ? "bg-blue-100 text-blue-900"
                                        : "bg-yellow-100 text-yellow-900"
                                  }`}
                                >
                                  {task.title}
                                </div>
                              ))}
                              {tasksForDay.length > 2 && (
                                <div className="text-xs text-muted-foreground px-1">+{tasksForDay.length - 2} more</div>
                              )}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </Card>
        </div>

        <div>
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Upcoming Tasks</h3>
            <div className="space-y-3">
              {upcomingTasks.length > 0 ? (
                upcomingTasks.map((task) => {
                  const project = projects.find((p) => p.id === task.projectId)
                  return (
                    <div
                      key={task.id}
                      className="p-3 border rounded-lg text-sm hover:bg-muted cursor-pointer transition"
                    >
                      <div className="font-medium truncate">{task.title}</div>
                      <div className="text-xs text-muted-foreground mt-1">{project?.name || "No Project"}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {task.dueDate &&
                          new Date(task.dueDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                      </div>
                      <div className="mt-2">
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium ${
                            task.status === "done"
                              ? "bg-green-100 text-green-900"
                              : task.status === "in-progress"
                                ? "bg-blue-100 text-blue-900"
                                : task.status === "pending"
                                  ? "bg-orange-100 text-orange-900"
                                  : "bg-gray-100 text-gray-900"
                          }`}
                        >
                          {task.status}
                        </span>
                      </div>
                    </div>
                  )
                })
              ) : (
                <p className="text-sm text-muted-foreground">No upcoming tasks</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
