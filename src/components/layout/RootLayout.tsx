
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { DarkModeToggle } from './DarkModeToggle'

// Basic site config
const siteConfig = {
  name: "VoteSphere"
}

interface RootLayoutProps {
  children: React.ReactNode
}

const RootLayout = ({ children }: RootLayoutProps) => {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Main content without header */}
      <main className="container relative">{children}</main>
      <footer className="bg-background py-10 md:py:12">
        <div className="container">
          <div className="border-t py-4 text-center text-sm text-muted-foreground">
            <div className="flex items-center justify-center mb-2">
              <img src="/lovable-uploads/bf1b1ff3-12c0-47bd-a774-a5197f3a9004.png" alt="VoteSphere Logo" className="h-6 w-6 mr-2" />
              <span>{siteConfig.name} &copy; {new Date().getFullYear()}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default RootLayout
