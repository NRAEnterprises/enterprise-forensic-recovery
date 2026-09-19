export const SCHEMAS = Object.freeze({
  case: 'recovery.case/v2',
  inventory: 'recovery.inventory/v2',
  findings: 'recovery.findings/v2',
  verification: 'recovery.verification/v2',
  report: 'recovery.report/v2',
  policy: 'recovery.policy/v1'
});

const required = {
  case: ['schema', 'id', 'createdAt', 'sources', 'artifacts', 'findings'],
  inventory: ['schema', 'generatedAt', 'caseId', 'files', 'errors', 'totals'],
  findings: ['schema', 'generatedAt', 'caseId', 'findings', 'summary'],
  verification: ['schema', 'generatedAt', 'caseId', 'checked', 'ok', 'totals'],
  report: ['schema', 'generatedAt', 'case', 'sections']
};

export function validateDocument(kind, value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`Invalid ${kind} document: expected object`);
  for (const key of required[kind] || []) if (!(key in value)) throw new Error(`Invalid ${kind} document: missing ${key}`);
  return value;
}

export function validateCase(caseInfo) {
  validateDocument('case', caseInfo);
  if (!Array.isArray(caseInfo.sources) || !Array.isArray(caseInfo.artifacts) || !Array.isArray(caseInfo.findings)) throw new Error('Invalid case document: arrays required');
  return caseInfo;
}
