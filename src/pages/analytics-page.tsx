"use client";

import { useApp } from "@/context/app-context";
import { Card } from "@/components/ui/card";
import { useMemo } from "react";

export function AnalyticsPage() {
  const { tasks, projects } = useApp();

  const analytics = useMemo(() => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === "done").length;
    const completionRate =
      totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    const tasksByStatus = {
      todo: tasks.filter((t) => t.status === "todo").length,
      inprogress: tasks.filter((t) => t.status === "inprogress").length,
      pending: tasks.filter((t) => t.status === "pending").length,
      done: tasks.filter((t) => t.status === "done").length,
    };

    const tasksByProject = projects.map((project) => ({
      name: project.name,
      total: tasks.filter((t) => t.projectId === project.id).length,
      completed: tasks.filter(
        (t) => t.projectId === project.id && t.status === "done"
      ).length,
    }));

    const overdueTasks = tasks.filter((t) => {
      if (!t.dueDate || t.status === "done") return false;
      return new Date(t.dueDate) < new Date();
    }).length;

    const thisWeekTasks = tasks.filter((t) => {
      if (!t.dueDate) return false;
      const taskDate = new Date(t.dueDate);
      const today = new Date();
      const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      return taskDate >= today && taskDate <= weekFromNow;
    }).length;

    const averageTasksPerProject =
      projects.length === 0 ? 0 : (totalTasks / projects.length).toFixed(1);

    return {
      totalTasks,
      completedTasks,
      completionRate,
      tasksByStatus,
      tasksByProject,
      overdueTasks,
      thisWeekTasks,
      averageTasksPerProject,
    };
  }, [tasks, projects]);

  const StatCard = ({ title, value, subtitle, color = "primary" }: any) => (
    <Card className="p-6">
      <div className="text-sm text-muted-foreground mb-2">{title}</div>
      <div className={`text-3xl font-bold text-${color}`}>{value}</div>
      {subtitle && (
        <div className="text-xs text-muted-foreground mt-2">{subtitle}</div>
      )}
    </Card>
  );

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Analytics</h1>
        <p className="text-muted-foreground">
          Track your productivity and progress
        </p>
      </div>
      {/* Key metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Tasks"
          value={analytics.totalTasks}
          subtitle="All tasks across projects"
        />
        <StatCard
          title="Completed"
          value={analytics.completedTasks}
          subtitle={`${analytics.completionRate}% completion rate`}
        />
        <StatCard
          title="Overdue"
          value={analytics.overdueTasks}
          subtitle="Tasks past due date"
          color="destructive"
        />
        <StatCard
          title="This Week"
          value={analytics.thisWeekTasks}
          subtitle="Tasks due in 7 days"
        />
      </div>
      {/* Status breakdown and project stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tasks by Status */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-6">Tasks by Status</h3>
          <div className="space-y-4">
            {Object.entries(analytics.tasksByStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="capitalize text-sm font-medium">
                  {status === "inprogress"
                    ? "In Progress"
                    : status.charAt(0).toUpperCase() + status.slice(1)}
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-24 bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{
                        width: `${
                          analytics.totalTasks === 0
                            ? 0
                            : (count / analytics.totalTasks) * 100
                        }%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-semibold w-8 text-right">
                    {count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
        {/* Project Statistics */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-6">Project Statistics</h3>
          <div className="space-y-4">
            {analytics.tasksByProject.length === 0 ? (
              <p className="text-muted-foreground text-sm">No projects yet</p>
            ) : (
              <>
                {analytics.tasksByProject.map((project) => (
                  <div key={project.name}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        {project.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {project.completed}/{project.total}
                      </span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{
                          width: `${
                            project.total === 0
                              ? 0
                              : (project.completed / project.total) * 100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
                <div className="pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Avg tasks per project
                    </span>
                    <span className="font-semibold">
                      {analytics.averageTasksPerProject}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>
      {/* Summary insights */}
      <Card className="p-6 mt-6">
        <h3 className="text-lg font-semibold mb-4">Insights</h3>
        <div className="space-y-3 text-sm">
          {analytics.completionRate === 100 && analytics.totalTasks > 0 && (
            <div className="text-green-600">
              🎉 All tasks completed! Great job!
            </div>
          )}
          {analytics.overdueTasks > 0 && (
            <div className="text-destructive">
              ⚠️ You have {analytics.overdueTasks} overdue task(s). Review them
              now.
            </div>
          )}
          {analytics.thisWeekTasks > 0 && (
            <div className="text-foreground">
              📅 {analytics.thisWeekTasks} task(s) due this week
            </div>
          )}
          {analytics.totalTasks === 0 && (
            <div className="text-muted-foreground">
              Start by creating projects and tasks to track your progress
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
