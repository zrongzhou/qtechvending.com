interface JsonLdProps {
  data: Record<string, unknown> | Record<string, unknown>[];
}

/**
 * Renders a JSON-LD structured-data <script> tag.
 * Safe for both Server and Client Components.
 */
export default function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is safe to inline here.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
