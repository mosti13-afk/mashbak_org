import Link from "next/link";
import { Logo } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="flex min-h-[70dvh] flex-col items-center justify-center gap-5 px-4 text-center">
      <Logo height={56} />
      <p className="text-7xl font-black text-navy">404</p>
      <p className="text-ink-2">لم نجد هذه الصفحة · Page not found · העמוד לא נמצא</p>
      <Link href="/" className="btn btn-primary">مشبك · Mashbak</Link>
    </div>
  );
}
