export const toEntityId = (name: string) =>
  'arch_' + name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
