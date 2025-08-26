import { addPublicSubscriber } from './actions'

export default async function SubscribePage({ params }: { params: { orgId: string } }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form action={addPublicSubscriber} className="w-full max-w-sm flex flex-col gap-4 p-6 border border-gray-200 rounded-lg shadow-sm bg-white">
        <input type="hidden" name="orgId" value={params.orgId} />
        <h1 className="text-xl font-semibold">Subscribe to Newsletter</h1>
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
          <input id="email" name="email" type="email" required className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="text-sm font-medium text-gray-700">Name (optional)</label>
          <input id="name" name="name" type="text" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
        </div>
        <button type="submit" className="px-4 py-2 rounded-md bg-black text-white text-sm font-medium hover:opacity-90 transition w-fit">Subscribe</button>
        <p className="text-xs text-gray-500">By subscribing, you agree to receive emails from this organization.</p>
      </form>
    </div>
  )
} 