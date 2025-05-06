
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { DarkModeToggle } from './DarkModeToggle'

// Basic site config
const siteConfig = {
  name: "Election System"
}

interface RootLayoutProps {
  children: React.ReactNode
}

const RootLayout = ({ children }: RootLayoutProps) => {
  return (
    <div className="flex min-h-screen flex-col bg-pattern-3">
      <main className="container relative glass-panel mx-4 my-4 md:mx-auto p-4 md:p-6">{children}</main>
      <footer className="bg-background/50 backdrop-blur-sm py-6 md:py-8 mt-4">
        <div className="container">
          <div className="border-t py-4 text-center text-sm text-muted-foreground">
            {/* Footer content here */}
          </div>
        </div>
      </footer>
    </div>
  )
}

export default RootLayout
