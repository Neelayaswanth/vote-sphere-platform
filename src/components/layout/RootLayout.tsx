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
    <div className="flex min-h-screen flex-col">
      {/* Remove the header to eliminate the extra navbar */}
      <main className="container relative">{children}</main>
      <footer className="bg-background py-10 md:py:12">
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
