import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import LanguageSelector from './LanguageSelector'
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
      <header className="container z-40 bg-background">
        <div className="flex h-20 items-center justify-between py-6">
          <Link to="/" className="flex items-center space-x-2">
            <span className="font-bold">
              {siteConfig.name}
            </span>
          </Link>
          <div className="flex items-center space-x-2">
            <LanguageSelector />
            <DarkModeToggle />
          </div>
        </div>
      </header>
      <main className="container relative pt-20 md:pt-24">{children}</main>
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
