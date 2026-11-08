"use client";

import clsx from "clsx";
import { ArrowUp, RotateCcw, Sparkles, Square } from "lucide-react";
import Link from "next/link";
import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";

type Msg = { role: "user" | "assistant"; content: string };

export interface MashbakniCopy {
  title: string; sub: string; placeholder: string; send: string; stop: string; reset: string; disclaimer: string; hello: string; suggestions: string[];
}

/* Minimal, safe markdown: **bold**, [text](/internal or https link), "- " / "1. " lists, paragraphs. No HTML injection. */
function inline(s: string, key: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*/g;
  let last = 0; let m: RegExpExecArray | null; let i = 0;
  while ((m = re.exec(s))) {
    if (m.index > last) out.push(s.slice(last, m.index));
    if (m[1]) {
      const href = m[2];
      if (href.startsWith("/")) out.push(<Link key={`${key}-${i++}`} href={href} className="font-semibold text-navy underline decoration-mint decoration-2 underline-offset-4">{m[1]}</Link>);
      else if (/^https:\/\//.test(href)) out.push(<a key={`${key}-${i++}`} href={href} target="_blank" rel="noopener noreferrer" className="font-semibold text-navy underline underline-offset-4">{m[1]}</a>);
      else out.push(m[1]);
    } else out.push(<strong key={`${key}-${i++}`} className="font-semibold text-ink">{m[3]}</strong>);
    last = re.lastIndex;
  }
  if (last < s.length) out.push(s.slice(last));
  return out;
}

function Markdown({ text }: { text: string }) {
  const blocks = text.replace(/\r/g, "").split(/\n{2,}/);
  return (
    <>
      {blocks.map((b, bi) => {
        const lines = b.split("\n").filter((l) => l.trim());
        if (lines.length && lines.every((l) => /^\s*([-*•]|\d+[.)])\s+/.test(l))) {
          const ordered = /^\s*\d/.test(lines[0]);
          const Tag = ordered ? "ol" : "ul";
          return (
            <Tag key={bi} className={clsx("my-2 space-y-1.5 ps-5", ordered ? "list-decimal" : "list-disc marker:text-mint")}>
              {lines.map((l, li) => <li key={li}>{inline(l.replace(/^\s*([-*•]|\d+[.)])\s+/, ""), `${bi}-${li}`)}</li>)}
            </Tag>
          );
        }
        return (
          <p key={bi} className="my-2 first:mt-0 last:mb-0">
            {lines.map((l, li) => <Fragment key={li}>{li > 0 && <br />}{inline(l.replace(/^#+\s*/, ""), `${bi}-${li}`)}</Fragment>)}
          </p>
        );
      })}
    </>
  );
}

export function Mashbakni({ locale, copy, firstName }: { locale: string; copy: MashbakniCopy; firstName: string }) {
  const storeKey = "mashbakni-chat-v1";
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    try { const raw = localStorage.getItem(storeKey); if (raw) setMsgs(JSON.parse(raw)); } catch { /* storage unavailable */ }
  }, []);
  useEffect(() => {
    try { if (!busy) localStorage.setItem(storeKey, JSON.stringify(msgs.slice(-30))); } catch { /* ignore */ }
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [msgs, busy]);

  async function send(text: string) {
    const q = text.trim();
    if (!q || busy) return;
    const next: Msg[] = [...msgs, { role: "user", content: q }];
    setMsgs([...next, { role: "assistant", content: "" }]);
    setInput("");
    setBusy(true);
    const ac = new AbortController();
    abortRef.current = ac;
    try {
      const res = await fetch("/api/mashbakni", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: next, locale }), signal: ac.signal });
      if (!res.body) throw new Error(String(res.status));
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += dec.decode(value, { stream: true });
        setMsgs([...next, { role: "assistant", content: acc }]);
      }
      if (!acc.trim()) setMsgs([...next, { role: "assistant", content: "…" }]);
    } catch (e) {
      if ((e as Error).name !== "AbortError") setMsgs([...next, { role: "assistant", content: locale === "en" ? "Connection problem, please try again." : locale === "he" ? "בעיית חיבור, נסו שוב." : "مشكلة في الاتصال، حاول مرة أخرى." }]);
    } finally {
      setBusy(false);
      abortRef.current = null;
      taRef.current?.focus();
    }
  }

  return (
    <div className="flex h-[calc(100dvh-9.5rem)] min-h-[480px] flex-col overflow-hidden rounded-[24px] border border-line bg-white shadow-[0_10px_30px_rgba(0,0,0,0.04)] lg:h-[calc(100dvh-7rem)]">
      <header className="flex items-center gap-3 border-b border-line bg-gradient-to-l from-mint-soft to-white px-4 py-3 sm:px-5">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-navy text-white"><Sparkles className="h-5 w-5" /></span>
        <div className="min-w-0 flex-1">
          <h1 className="text-[17px] font-bold text-ink">{copy.title}</h1>
          <p className="truncate text-[13px] text-mist">{copy.sub}</p>
        </div>
        {msgs.length > 0 && (
          <button type="button" onClick={() => { abortRef.current?.abort(); setMsgs([]); }} className="flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-[13px] text-ink-2 hover:bg-haze/50">
            <RotateCcw className="h-4 w-4" /><span className="hidden sm:inline">{copy.reset}</span>
          </button>
        )}
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6" aria-live="polite">
        {msgs.length === 0 ? (
          <div className="mx-auto flex h-full max-w-xl flex-col items-center justify-center text-center">
            <span className="grid h-16 w-16 place-items-center rounded-[22px] bg-mint-soft text-navy"><Sparkles className="h-8 w-8" /></span>
            <p className="mt-4 text-[20px] font-semibold text-ink">{copy.hello.replace("{name}", firstName)}</p>
            <p className="mt-1 text-[15px] text-ink-2">{copy.sub}</p>
            <div className="mt-6 grid w-full gap-2 sm:grid-cols-2">
              {copy.suggestions.map((s) => (
                <button key={s} type="button" onClick={() => send(s)}
                  className="rounded-2xl border border-line bg-white px-4 py-3 text-start text-[14px] leading-6 text-ink-2 transition hover:border-mint hover:bg-mint-soft hover:text-ink">{s}</button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl space-y-4">
            {msgs.map((m, i) => (
              <div key={i} className={clsx("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                {m.role === "user" ? (
                  <div className="max-w-[85%] whitespace-pre-wrap rounded-[20px] rounded-ee-md bg-navy px-4 py-2.5 text-[15px] leading-7 text-white">{m.content}</div>
                ) : (
                  <div className="flex max-w-[92%] gap-2.5">
                    <span className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-xl bg-mint-soft text-navy"><Sparkles className="h-4 w-4" /></span>
                    <div className="rounded-[20px] rounded-ss-md bg-sky px-4 py-2.5 text-[15px] leading-7 text-ink-2 ring-1 ring-line">
                      {m.content ? <Markdown text={m.content} /> : (
                        <span className="inline-flex gap-1 py-2" aria-label="…">
                          {[0, 1, 2].map((d) => <span key={d} className="h-2 w-2 animate-bounce rounded-full bg-mint" style={{ animationDelay: `${d * 120}ms` }} />)}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={endRef} />
          </div>
        )}
      </div>

      <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="border-t border-line bg-white p-3 sm:p-4">
        <div className="mx-auto flex max-w-3xl items-end gap-2 rounded-[18px] border border-line bg-white p-1.5 ps-4 focus-within:border-navy">
          <textarea ref={taRef} value={input} onChange={(e) => setInput(e.target.value)} rows={1} placeholder={copy.placeholder} dir="auto"
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); send(input); } }}
            className="max-h-40 min-h-[40px] flex-1 resize-none bg-transparent py-2 text-[15px] leading-6 outline-none placeholder:text-mist [field-sizing:content]" />
          {busy ? (
            <button type="button" onClick={() => abortRef.current?.abort()} aria-label={copy.stop} className="grid h-10 w-10 shrink-0 place-items-center rounded-[14px] bg-ink text-white"><Square className="h-4 w-4" fill="currentColor" /></button>
          ) : (
            <button type="submit" disabled={!input.trim()} aria-label={copy.send} className="grid h-10 w-10 shrink-0 place-items-center rounded-[14px] bg-navy text-white transition disabled:bg-haze disabled:text-mist"><ArrowUp className="h-5 w-5" /></button>
          )}
        </div>
        <p className="mt-2 text-center text-[11px] text-mist">{copy.disclaimer}</p>
      </form>
    </div>
  );
}
