/**
 * Tags in the data store are prefixed with "#" (e.g. "#CPU", "#関係モデル").
 * The URL form strips the prefix for cleaner paths: /tag/CPU, /tag/関係モデル.
 */

export function tagToSlug(tag: string): string {
  return encodeURIComponent(tag.replace(/^#/, ""));
}

export function slugToTag(slug: string): string {
  const decoded = decodeURIComponent(slug);
  return decoded.startsWith("#") ? decoded : `#${decoded}`;
}
