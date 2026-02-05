export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-neutral-50 p-6">
      <div className="mx-auto max-w-md">{children}</div>
    </main>
  );
}
