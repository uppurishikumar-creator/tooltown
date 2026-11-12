// Part 4 - Validation
// Each function returns an error message string, or null when the input is valid.

const TOOL_KINDS = ['drill', 'saw', 'sander', 'hammer', 'screwdriver', 'wrench', 'clamp', 'other'];

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function validateTool(body) {
  if (!body || typeof body !== 'object') return 'Request body must be JSON';
  if (!isNonEmptyString(body.name)) return 'name is required and must be a non-empty string';
  if (body.name.trim().length > 100) return 'name must be 100 characters or fewer';
  if (!isNonEmptyString(body.kind)) return 'kind is required and must be a non-empty string';
  if (!TOOL_KINDS.includes(body.kind.trim().toLowerCase())) {
    return `kind must be one of: ${TOOL_KINDS.join(', ')}`;
  }
  return null;
}

function validateMaker(body) {
  if (!body || typeof body !== 'object') return 'Request body must be JSON';
  if (!isNonEmptyString(body.name)) return 'name is required and must be a non-empty string';
  if (!isNonEmptyString(body.email)) return 'email is required and must be a non-empty string';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())) return 'email must be a valid email address';
  return null;
}

function validateLoan(body) {
  if (!body || typeof body !== 'object') return 'Request body must be JSON';
  if (!Number.isInteger(body.maker_id) || body.maker_id < 1) return 'maker_id is required and must be a positive integer';
  if (!Number.isInteger(body.tool_id) || body.tool_id < 1) return 'tool_id is required and must be a positive integer';
  if (body.due_date !== undefined) {
    if (typeof body.due_date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(body.due_date) || isNaN(Date.parse(body.due_date))) {
      return 'due_date must be a date in YYYY-MM-DD format';
    }
  }
  return null;
}

// Turns ":id" from the URL into a number, or null if it is not a valid id.
function parseId(raw) {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

module.exports = { TOOL_KINDS, validateTool, validateMaker, validateLoan, parseId };
