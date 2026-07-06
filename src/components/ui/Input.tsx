import { cn } from '@/lib/utils';

export const inputClassName =
  'w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white outline-none transition placeholder:text-zinc-600 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30';

export const adminInputClassName =
  'w-full rounded-xl border border-admin-border bg-admin-bg px-4 py-2.5 text-white outline-none transition focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30';

interface FieldProps {
  label: string;
  children: React.ReactNode;
  className?: string;
}

export function Field({ label, children, className }: FieldProps) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-sm text-zinc-400">{label}</label>
      {children}
    </div>
  );
}

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(inputClassName, className)} {...props} />;
}

export function Select({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(inputClassName, className)} {...props}>
      {children}
    </select>
  );
}

export function AdminInput({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(adminInputClassName, className)} {...props} />;
}

export function AdminSelect({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(adminInputClassName, className)} {...props}>
      {children}
    </select>
  );
}
