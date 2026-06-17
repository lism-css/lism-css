import type { ReactNode } from 'react';

// withLism が `lism-css/main.css` を config 反映済みの生成 CSS（`.lism-css/css/main.css`）へ alias する。
import 'lism-css/main.css';

export const metadata = {
  title: 'Minimal Next + Lism CSS',
  description: 'Minimal Next.js (App Router) example for Lism CSS',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
