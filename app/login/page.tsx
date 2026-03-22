import { login } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <form action={login} className="w-full max-w-xs space-y-4">
        <div className="text-center">
          <h1 className="text-lg font-semibold">Social Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Enter password to continue
          </p>
        </div>
        <input
          type="password"
          name="password"
          placeholder="Password"
          className="w-full border rounded-lg px-3 py-2 text-sm"
          autoFocus
        />
        {error && (
          <p className="text-xs text-red-500">Incorrect password</p>
        )}
        <button
          type="submit"
          className="w-full bg-foreground text-background rounded-lg py-2 text-sm font-medium hover:bg-foreground/90 transition-colors"
        >
          Sign In
        </button>
      </form>
    </div>
  );
}
