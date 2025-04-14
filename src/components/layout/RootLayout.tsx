import { useState, useEffect } from "react"
import { useTheme } from "next-themes"

import { ModeToggle } from "@/components/mode-toggle"
import { MainNav } from "@/components/main-nav"
import { siteConfig } from "@/config/site"
import { Link } from "react-router-dom"
import LanguageSelector from './LanguageSelector';

export function DarkModeToggle() {
  const [mounted, setMounted] = useState(false)
  const { setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="flex items-center space-x-2">
      <ModeToggle />
    </div>
  )
}

interface RootLayoutProps {
  children: React.ReactNode
}

const RootLayout = ({ children }: RootLayoutProps) => {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="container z-40 bg-background">
        <div className="flex h-20 items-center justify-between py-6">
          <MainNav items={siteConfig.mainNav} />
          <Link to="/" className="mr-6 flex items-center space-x-2">
            {/* <Icons.logo className="h-6 w-6" /> */}
            <span className="hidden font-bold sm:inline-block">
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
      <footer className="bg-background py-10 md:py-12">
        <div className="container">
          <div className="border-t py-4 text-center text-sm text-muted-foreground">
            {/* Made with <Heart className="mx-1 inline-block h-4 w-4" /> by{" "} */}
            {/* <a
              href="https://shadcn.com"
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              shadcn
            </a> */}
          </div>
        </div>
      </footer>
    </div>
  )
}

export default RootLayout
