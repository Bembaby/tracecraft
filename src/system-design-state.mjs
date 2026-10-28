import { NODE_TYPES } from './system-design-engine.mjs';

export const DESIGN_STORAGE_KEY = 'tracecraft:system-design:v1';
export const DESIGN_BACKUP_FORMAT = 'tracecraft-system-design';
const record = value => value && typeof value === 'object' && !Array.isArray(value);
const finite = (value, fallback, min, max) => {
  // A JSON object can shadow valueOf/toString. Do not invoke coercion hooks on
  // imported objects merely to sanitize a numeric field.
  const candidate = typeof value === 'number' ? value : typeof value === 'string' && value.trim() ? Number(value) : NaN;
  return Number.isFinite(candidate) ? Math.min(max, Math.max(min, candidate)) : fallback;
};
const text = (value, max = 120) => typeof value === 'string' ? value.slice(0, max) : '';
const safeId = value => typeof value === 'string' && /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,63}$/.test(value) && !['constructor', 'prototype', '__proto__'].includes(value);

// Drafts may be incomplete. Preserve safe disconnected/cyclic diagrams so the
// learner can fix them; the engine separately checks simulation semantics.
export function sanitizeDesign(value) {
  if (!record(value) || !Array.isArray(value.nodes) || !Array.isArray(value.edges)) return null;
  if (value.nodes.length > 24 || value.edges.length > 60) return null;
  const ids = new Set();
  const nodes = [];
  for (const node of value.nodes) {
    if (!record(node) || !safeId(node.id) || !Object.hasOwn(NODE_TYPES, node.type) || ids.has(node.id)) return null;
    ids.add(node.id);
    const config = Object.create(null);
    for (const key of Object.keys(NODE_TYPES[node.type].defaults)) {
      if (record(node.config) && Number.isFinite(node.config[key])) config[key] = node.config[key];
    }
    nodes.push({ id: node.id, type: node.type, label: text(node.label, 40) || NODE_TYPES[node.type].label,
      x: finite(node.x, 40, 16, 840), y: finite(node.y, 60, 16, 460), config });
  }
  const edgeIds = new Set();
  const edges = [];
  for (const edge of value.edges) {
    if (!record(edge) || !safeId(edge.id) || edgeIds.has(edge.id) || !ids.has(edge.from) || !ids.has(edge.to)) return null;
    edgeIds.add(edge.id);
    edges.push({ id: edge.id, from: edge.from, to: edge.to });
  }
  return { nodes, edges };
}

export function sanitizeSettings(value = {}) {
  if (!record(value)) value = {};
  return {
    rps: finite(value.rps, 300, 0, 20000),
    readPercent: finite(value.readPercent, 80, 0, 100),
    durationSeconds: finite(value.durationSeconds, 30, 1, 300),
    failedNodeIds: Array.isArray(value.failedNodeIds) ? [...new Set(value.failedNodeIds.filter(safeId))].slice(0, 24) : [],
  };
}

export function freshDesignWorkspace() { return { version: 1, selectedChallenge: '', drafts: {}, attempts: [] }; }

export function validateDesignWorkspace(value, challengeIds = []) {
  if (!record(value) || value.version !== 1) throw new Error('This is not a supported system design backup.');
  const allowed = new Set(challengeIds);
  const workspace = freshDesignWorkspace();
  const known = id => safeId(id) && (!allowed.size || allowed.has(id));
  if (known(value.selectedChallenge)) workspace.selectedChallenge = value.selectedChallenge;
  if (record(value.drafts)) {
    for (const [id, entry] of Object.entries(value.drafts).slice(0, 50)) {
      if (!known(id) || !record(entry)) continue;
      const graph = sanitizeDesign(entry.graph);
      if (!graph) continue;
      workspace.drafts[id] = {
        graph, settings: sanitizeSettings(entry.settings), notes: text(entry.notes, 6000),
        helpLevel: ['hint', 'solution', 'bug'].includes(entry.helpLevel) ? entry.helpLevel : 'none',
        updatedAt: text(entry.updatedAt, 40),
      };
    }
  }
  if (Array.isArray(value.attempts)) {
    workspace.attempts = value.attempts.slice(-100).filter(a => record(a) && known(a.challengeId) && typeof a.passed === 'boolean').map(a => ({
      challengeId: a.challengeId, at: text(a.at, 40), passed: a.passed,
      passedChecks: finite(a.passedChecks, 0, 0, 500), totalChecks: finite(a.totalChecks, 0, 0, 500),
      helpLevel: ['hint', 'solution', 'bug'].includes(a.helpLevel) ? a.helpLevel : 'none',
      notes: text(a.notes, 6000),
      graph: sanitizeDesign(a.graph), settings: sanitizeSettings(a.settings),
    }));
  }
  return workspace;
}

export function designBackup(workspace) {
  return { format: DESIGN_BACKUP_FORMAT, version: 1, exportedAt: new Date().toISOString(), data: workspace };
}

export function parseDesignBackup(source, challengeIds) {
  if (typeof source !== 'string' || source.length > 2_000_000) throw new Error('Choose a system design JSON backup smaller than 2 MB.');
  let parsed;
  try { parsed = JSON.parse(source); } catch { throw new Error('The selected file is not valid JSON.'); }
  if (parsed?.format !== DESIGN_BACKUP_FORMAT || parsed.version !== 1) throw new Error('Choose a TraceCraft system design backup. Daily-session backups use a separate import.');
  return validateDesignWorkspace(parsed.data, challengeIds);
}
