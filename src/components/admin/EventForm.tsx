import { deleteEvent, saveEvent } from "@/app/actions";
import type { Dict, Locale } from "@/i18n";
import { toLocalInput } from "@/lib/format";
import type { EventItem } from "@/lib/types";
import { Check, Field } from "../ui";
import { SubmitButton } from "../ui/client";
import { L10nFields } from "./L10nFields";

export function EventForm({ e, locale, t }: { e?: EventItem; locale: Locale; t: Dict }) {
  const F = t.admin.f;
  const start = e?.starts_at ?? new Date(Date.now() + 7 * 86400000).toISOString();
  const end = e?.ends_at ?? new Date(Date.parse(start) + 2 * 3600000).toISOString();
  return (
    <div className="space-y-4">
      <form action={saveEvent} className="card space-y-5 p-6">
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="id" value={e?.id ?? ""} />
        <L10nFields name="title" labels={[F.titleAr, F.titleEn, F.titleHe]} value={e?.title} required />
        <L10nFields name="description" labels={[F.descAr, F.descEn, F.descHe]} value={e?.description} textarea rows={4} />
        <L10nFields name="location" labels={[F.locAr, F.locEn, F.locHe]} value={e?.location} />
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label={F.starts}><input type="datetime-local" name="starts_at" required defaultValue={toLocalInput(start)} className="input" dir="ltr" /></Field>
          <Field label={F.ends}><input type="datetime-local" name="ends_at" required defaultValue={toLocalInput(end)} className="input" dir="ltr" /></Field>
          <Field label={F.capacity}><input type="number" name="capacity" min={1} defaultValue={e?.capacity ?? ""} className="input" dir="ltr" /></Field>
          <Field label={F.status}>
            <select name="status" defaultValue={e?.status ?? "published"} className="select">
              <option value="published">{t.admin.statuses.published}</option>
              <option value="draft">{t.admin.statuses.draft}</option>
              <option value="cancelled">{t.admin.statuses.cancelled}</option>
            </select>
          </Field>
          <Field label={F.cover} className="sm:col-span-2"><input name="cover_url" defaultValue={e?.cover_url ?? ""} className="input" dir="ltr" placeholder="https://…" /></Field>
          <Field label={F.onlineUrl} className="sm:col-span-2"><input name="online_url" defaultValue={e?.online_url ?? ""} className="input" dir="ltr" placeholder="https://zoom.us/…" /></Field>
        </div>
        <div className="flex flex-wrap gap-6">
          <Check name="is_online" label={F.online} defaultChecked={e?.is_online} />
          <Check name="members_only" label={F.membersOnly} defaultChecked={e?.members_only ?? true} />
        </div>
        <SubmitButton className="btn btn-primary">{t.common.save}</SubmitButton>
      </form>
      {e?.id && (
        <form action={deleteEvent} className="text-end">
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="id" value={e.id} />
          <SubmitButton className="btn btn-ghost btn-sm text-[#b3261e]" confirm={`${t.common.delete}?`}>{t.common.delete}</SubmitButton>
        </form>
      )}
    </div>
  );
}
