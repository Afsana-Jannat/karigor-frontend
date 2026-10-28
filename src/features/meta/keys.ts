export const metaKeys = {
  all: ['meta'] as const,
  options: () => [...metaKeys.all, 'options'] as const,
};
