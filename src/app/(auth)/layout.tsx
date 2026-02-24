export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: `
            radial-gradient(ellipse at 30% 30%, rgba(255, 106, 0, 0.08) 0%, transparent 50%),
            radial-gradient(ellipse at 70% 70%, rgba(0, 200, 255, 0.08) 0%, transparent 50%),
            #050810
          `,
        }}
      />
      <div className="w-full max-w-md">{children}</div>
    </main>
  );
}
