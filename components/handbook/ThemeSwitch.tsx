"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"

interface ThemeSwitchProps {
  isDark: boolean
  onToggle: () => void
}

export default function ThemeSwitch({ isDark, onToggle }: ThemeSwitchProps) {
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={onToggle}
      aria-label="Toggle theme"
      className="h-8 w-8 border"
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  )
}
