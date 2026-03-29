import { SignIn } from "@clerk/nextjs"

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 mb-4">
            <span className="text-white font-bold text-lg">Z</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Zennify Project Planner</h1>
          <p className="text-slate-500 mt-1">Sign in to access your projects</p>
        </div>
        <SignIn />
      </div>
    </div>
  )
}
