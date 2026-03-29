import { UserButton } from "@clerk/nextjs"
import Link from "next/link"
import { LayoutDashboard, Settings } from "lucide-react"

export default function InternalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white sticky top-0 z-40">
        <div className="flex h-14 items-center px-6 gap-4">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-slate-900 hover:opacity-80 transition-opacity">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">Z</span>
            </div>
            <span className="text-sm">Project Planner</span>
          </Link>
          <nav className="flex items-center gap-1 ml-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <LayoutDashboard className="w-4 h-4" />
              Projects
            </Link>
            <Link
              href="/admin/standards"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <Settings className="w-4 h-4" />
              Standards
            </Link>
          </nav>
          <div className="ml-auto">
            <UserButton />
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  )
}
