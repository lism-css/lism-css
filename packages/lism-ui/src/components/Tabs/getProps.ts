export function getTabProps({ set = 'plain', ...props }: { set?: unknown; [key: string]: unknown }) {
  return {
    as: 'button',
    set,
    ...props,
  };
}
