// ═══════════════════════════════════════════════════════════════
// ARES-305 — JSON-LD Component
// Inyecta structured data en <head> como <script type="application/ld+json">
// ═══════════════════════════════════════════════════════════════

interface JsonLdProps {
  data: Record<string, unknown> | Record<string, unknown>[];
}

export function JsonLd({ data }: JsonLdProps) {
  const schemas = Array.isArray(data) ? data : [data];

  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={`jsonld-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}
