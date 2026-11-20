const SKILL_LEVELS = ['beginner', 'intermediate', 'advanced', 'expert'];

const normalizeSkills = (skills) => {
  if (!Array.isArray(skills)) {
    throw new TypeError('Skills must be provided as a list.');
  }
  if (skills.length > 100) {
    throw new RangeError('A maximum of 100 skills can be saved.');
  }

  const byName = new Map();
  skills.forEach((skill) => {
    const entry = typeof skill === 'string' ? { name: skill } : skill;
    if (!entry || typeof entry.name !== 'string') {
      throw new TypeError('Each skill must have a name.');
    }
    const name = entry.name.trim();
    if (!name || name.length > 80) {
      throw new RangeError('Skill names are required and must be 80 characters or fewer.');
    }

    const proficiency = entry.proficiency || 'beginner';
    if (!SKILL_LEVELS.includes(proficiency)) {
      throw new TypeError(`Skill proficiency must be one of: ${SKILL_LEVELS.join(', ')}.`);
    }
    const yearsExperience = entry.yearsExperience == null || entry.yearsExperience === ''
      ? 0
      : Number(entry.yearsExperience);
    if (!Number.isInteger(yearsExperience) || yearsExperience < 0 || yearsExperience > 50) {
      throw new RangeError('Years of experience must be a whole number from 0 to 50.');
    }

    const key = name.toLowerCase();
    if (!byName.has(key)) {
      byName.set(key, { name, proficiency, yearsExperience });
    }
  });
  return [...byName.values()];
};

const skillNames = (skills = []) => skills
  .map((skill) => (typeof skill === 'string' ? skill : skill?.name))
  .filter((name) => typeof name === 'string' && name.trim())
  .map((name) => name.trim());

const validateProfileArray = (items, field, fields, maxItems = 30) => {
  if (!Array.isArray(items)) throw new TypeError(`${field} must be a list.`);
  if (items.length > maxItems) throw new RangeError(`${field} can contain at most ${maxItems} entries.`);
  return items.map((item, index) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      throw new TypeError(`${field} entry ${index + 1} is invalid.`);
    }
    const normalized = {};
    fields.forEach(([name, maxLength]) => {
      const value = item[name];
      if (value != null && typeof value !== 'string') {
        throw new TypeError(`${field} ${name} must be text.`);
      }
      const clean = (value || '').trim();
      if (clean.length > maxLength) {
        throw new RangeError(`${field} ${name} must be ${maxLength} characters or fewer.`);
      }
      normalized[name] = clean;
    });
    if (item.current != null) {
      if (typeof item.current !== 'boolean') throw new TypeError(`${field} current must be true or false.`);
      normalized.current = item.current;
    }
    if (item.startDate) {
      const date = new Date(item.startDate);
      if (Number.isNaN(date.getTime())) throw new TypeError(`${field} start date is invalid.`);
      normalized.startDate = date;
    }
    if (item.endDate) {
      const date = new Date(item.endDate);
      if (Number.isNaN(date.getTime())) throw new TypeError(`${field} end date is invalid.`);
      normalized.endDate = date;
    }
    if (normalized.startDate && normalized.endDate && normalized.startDate > normalized.endDate) {
      throw new RangeError(`${field} end date must be on or after its start date.`);
    }
    if (normalized.current === true && normalized.endDate) {
      throw new RangeError(`${field} end date must be empty while it is marked current.`);
    }
    if (!Object.values(normalized).some((value) => typeof value === 'string' && value)) {
      throw new TypeError(`${field} entry ${index + 1} must include at least one detail.`);
    }
    return normalized;
  });
};

module.exports = {
  normalizeSkills,
  skillNames,
  validateProfileArray
};
