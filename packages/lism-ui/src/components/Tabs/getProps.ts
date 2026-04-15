import mergeSet from 'lism-css/lib/helper/mergeSet';

export function getTabProps({ set, ...props }: { set?: unknown; [key: string]: unknown }) {
  return {
    as: 'button',
    set: mergeSet('plain', set),
    ...props,
  };
}
