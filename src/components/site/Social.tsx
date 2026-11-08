/* Small brand marks drawn inline (lucide no longer ships brand icons). */
export function SocialIcon({ name, className = "h-4 w-4" }: { name: "linkedin" | "instagram" | "whatsapp"; className?: string }) {
  if (name === "linkedin")
    return <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3zM9 9h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05C20.6 8.65 21 11 21 14v7h-4v-6.2c0-1.48-.03-3.38-2.06-3.38-2.06 0-2.38 1.6-2.38 3.27V21H9z" /></svg>;
  if (name === "instagram")
    return <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" /></svg>;
  return <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.15l-.3-.18-3 .78.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.25-.12-1.47-.72-1.7-.8-.23-.09-.39-.13-.56.12-.16.25-.64.8-.79.96-.14.17-.29.19-.54.07a6.7 6.7 0 0 1-3.3-2.9c-.25-.43.25-.4.71-1.33.08-.17.04-.31-.02-.43l-.76-1.83c-.2-.48-.4-.41-.56-.42h-.48a.92.92 0 0 0-.66.31 2.8 2.8 0 0 0-.87 2.07 4.85 4.85 0 0 0 1.02 2.58 11.1 11.1 0 0 0 4.25 3.75c1.58.68 2.2.74 3 .62.48-.07 1.47-.6 1.68-1.18.2-.58.2-1.08.14-1.18-.06-.1-.22-.16-.47-.28Z" /></svg>;
}

export function SocialRow({ c, className = "" }: { c: { linkedInUrl?: string; instagramUrl?: string; whatsappUrl?: string }; className?: string }) {
  const items = [
    { href: c.instagramUrl, name: "instagram" as const, label: "Instagram" },
    { href: c.whatsappUrl, name: "whatsapp" as const, label: "WhatsApp" },
    { href: c.linkedInUrl, name: "linkedin" as const, label: "LinkedIn" },
  ].filter((i) => i.href);
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {items.map((i) => (
        <a key={i.name} href={i.href} target="_blank" rel="noreferrer" aria-label={i.label}
          className="grid h-8 w-8 place-items-center rounded-full border border-current/20 transition hover:scale-105">
          <SocialIcon name={i.name} />
        </a>
      ))}
    </div>
  );
}
