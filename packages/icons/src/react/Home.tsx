// 自動生成: scripts/generate.mjs（編集元: src/svg/）
import { forwardRef, type SVGProps } from 'react';

export type HomeProps = SVGProps<SVGSVGElement> & { size?: number | string };
const Home = /* @__PURE__ */ forwardRef<SVGSVGElement, HomeProps>(function Home(
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
      <path d="M3,12L11.47,3.53c.141-.141.331-.22.53-.22s.39.079.53.22l8.47,8.47" />
      <path d="M4.8,10.2v10.05c0,.414.336.75.75.75h3.3c.414,0,.75-.336.75-.75v-5.7c0-.414.336-.75.75-.75h3.3c.414,0,.75.336.75.75v5.7c0,.414.336.75.75.75h3.3c.414,0,.75-.336.75-.75v-10.05" />
      {children}
    </svg>
  );
});

export default Home;
