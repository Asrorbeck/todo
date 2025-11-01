"use client"

import { AppProvider } from "@/context/app-context"
import { MainLayout } from "@/components/layout/main-layout"

export default function Home() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  )
}
