// components/ui/PageWrapper.tsx
export function PageWrapper({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="min-h-full">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">{title}</h1>
      {children}
    </div>
  );
}
