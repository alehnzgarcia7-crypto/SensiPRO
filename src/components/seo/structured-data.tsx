// ═══════════════════════════════════════════════════════════════
// ARES-800 — StructuredData Component
// Inyecta JSON-LD en <head> para schema.org structured data
// ═══════════════════════════════════════════════════════════════

interface StructuredDataProps {
  data: Record<string, unknown> | Record<string, unknown>[];
}

export function StructuredData({ data }: StructuredDataProps) {
  const jsonLd = Array.isArray(data) ? data : [data];

  return (
    <>
      {jsonLd.map((schema, i) => (
        <script
          key={`structured-${i}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}
