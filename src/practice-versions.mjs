export const CONTENT_REVISION = '2026-10-29.3';
export const RUNTIME_VERSIONS = {java:'teavm-0.16.0-javac-208d4c9', sql:'sql.js-1.15.2', python:'pyodide-314.0.7', design:'flow-model-v1'};
export function attemptVersions(value={}) {
  const label=(text,fallback)=>typeof text==='string' && /^[a-zA-Z0-9._-]{1,80}$/.test(text)?text:fallback;
  return {contentRevision:label(value.contentRevision,'historical-unversioned'),runtimeVersion:label(value.runtimeVersion,'historical-unversioned')};
}
