import { login, signup } from '@/app/login/actions'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form className="w-full max-w-sm flex flex-col gap-4 p-6 border border-gray-200 rounded-lg shadow-sm bg-white">
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
          <input id="email" name="email" type="email" required className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="password" className="text-sm font-medium text-gray-700">Password</label>
          <input id="password" name="password" type="password" required className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
        </div>
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button formAction={login} className="w-full sm:w-auto px-4 py-2 rounded-md bg-black text-white text-sm font-medium hover:opacity-90 transition">Log in</button>
          <button formAction={signup} className="w-full sm:w-auto px-4 py-2 rounded-md border border-gray-300 text-sm font-medium hover:bg-gray-50 transition">Sign up</button>
        </div>
      </form>
    </div>
  )
}