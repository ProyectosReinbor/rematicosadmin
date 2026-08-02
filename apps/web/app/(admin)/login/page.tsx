import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login — Admin",
  description: "Iniciar sesión en el panel de administración",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Admin</h1>
          <p className="mt-2 text-muted-foreground">
            Inicia sesión para acceder al panel de administración
          </p>
        </div>
        <form className="space-y-4" method="post" action="/api/auth/login">
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 w-full rounded border px-3 py-2"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="mt-1 w-full rounded border px-3 py-2"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded bg-primary px-4 py-2 text-primary-foreground"
          >
            Iniciar sesión
          </button>
        </form>
      </div>
    </main>
  );
}