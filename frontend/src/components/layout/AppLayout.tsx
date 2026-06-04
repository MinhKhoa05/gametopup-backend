import type { ReactNode } from 'react';

type AppLayoutProps = {
  bottomNav?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  header?: ReactNode;
  isAdminRoute?: boolean;
  toast?: ReactNode;
};

export function AppLayout({ bottomNav, children, footer, header, isAdminRoute = false, toast }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-ink text-slate-100">
      {!isAdminRoute && header}

      <main className="flex flex-1 flex-col pb-[env(safe-area-inset-bottom,0px)]">{children}</main>

      {!isAdminRoute && footer}
      {!isAdminRoute && bottomNav}
      {toast}
    </div>
  );
}
