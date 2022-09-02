export default (prefix = '_') => `${prefix}${Math.random().toString(36).substring(2)}`;
