import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/sign-in");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gray-50 p-8">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="mb-2 text-xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mb-1 text-sm text-gray-500">
          Signed in as <span className="font-medium text-gray-700">{session.user?.email}</span>
        </p>
        <p className="mb-6 text-xs text-gray-400">User ID: {session.user?.id}</p>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <button
            type="submit"
            className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Sign out
          </button>
        </form>
      </div>
    </main>
  );
}
