export const resolveBooleanProps = (
  props: boolean | undefined,
  fallback: boolean,
): boolean => {
  return props !== undefined ? props : fallback;
};
