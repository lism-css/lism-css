// 自動生成: scripts/generate.mjs（編集元: src/svg/）
import { forwardRef, type SVGProps } from 'react';

export type ChatProps = SVGProps<SVGSVGElement> & { size?: number | string };
const Chat = /* @__PURE__ */ forwardRef<SVGSVGElement, ChatProps>(function Chat(
  { children, size = '1em', width = size, height = size, ...props },
  ref
) {
  const labelled = Boolean(props['aria-label'] || props['aria-labelledby']);
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={width}
      height={height}
      focusable="false"
      aria-hidden={labelled ? undefined : true}
      role={labelled ? 'img' : undefined}
      {...props}
      ref={ref}
    >
      <circle cx="12" cy="12" r=".375" />
      <circle cx="7.875" cy="12" r=".375" />
      <circle cx="16.125" cy="12" r=".375" />
      <path d="M4.233,21.573c-.317.267-.79.226-1.057-.091-.113-.135-.176-.305-.176-.482V6c0-.414.336-.75.75-.75h16.5c.414,0,.75.336.75.75v12c0,.414-.336.75-.75.75H7.5l-3.267,2.823Z" />
      {children}
    </svg>
  );
});

export default Chat;
