import type { L10n } from "@/i18n/config";

/** Three inputs (ar/en/he) for one localized field. Field names: `${name}_ar` etc. */
export function L10nFields({ name, labels, value, textarea = false, required = false, rows = 3 }: {
  name: string; labels: [string, string, string]; value?: L10n; textarea?: boolean; required?: boolean; rows?: number;
}) {
  const langs = [["ar", "rtl"], ["en", "ltr"], ["he", "rtl"]] as const;
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {langs.map(([l, dir], i) => (
        <label key={l} className="block">
          <span className="label">{labels[i]}</span>
          {textarea ? (
            <textarea name={`${name}_${l}`} defaultValue={value?.[l] ?? ""} dir={dir} rows={rows} required={required && l === "ar"} className="textarea min-h-0" />
          ) : (
            <input name={`${name}_${l}`} defaultValue={value?.[l] ?? ""} dir={dir} required={required && l === "ar"} className="input" />
          )}
        </label>
      ))}
    </div>
  );
}
