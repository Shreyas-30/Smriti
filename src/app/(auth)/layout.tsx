export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-dvh bg-[#f0eade] px-6 py-8">
      <div className="mx-auto max-w-md">{children}</div>
    </main>
  );
}
