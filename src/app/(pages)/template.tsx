/**
 * Wraps each inner page and is created afresh on every navigation, so each page arrives with a
 * soft fade and rise instead of a cut ("Page arrival" in globals.css; off for reduced motion).
 */
export default function PagesTemplate({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className="page-arrive">{children}</div>;
}
