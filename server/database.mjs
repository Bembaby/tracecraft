// Preserve today's certificate verification when pg changes sslmode semantics.
export function databaseUrl(value) {
  const url=new URL(value);
  if(['require','prefer','verify-ca'].includes(url.searchParams.get('sslmode')))url.searchParams.set('sslmode','verify-full');
  return url.toString();
}
