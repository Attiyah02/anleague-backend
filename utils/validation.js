// --------------------------------------------------
// validation.js - Input Validation & Security
// --------------------------------------------------
// Demonstrates: Data validation, Input sanitization, Security
// --------------------------------------------------

export class ValidationError extends Error {
  constructor(message, field = null) {
    super(message);
    this.name = "ValidationError";
    this.field = field;
  }
}

export const Validators = {
  // Email validation with regex
  email(email) {
    if (!email || typeof email !== 'string') {
      throw new ValidationError("Email is required", "email");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const trimmed = email.trim().toLowerCase();
    
    if (!emailRegex.test(trimmed)) {
      throw new ValidationError("Invalid email format", "email");
    }

    if (trimmed.length > 255) {
      throw new ValidationError("Email too long", "email");
    }

    return trimmed;
  },

  // Password validation
  password(password) {
    if (!password || typeof password !== 'string') {
      throw new ValidationError("Password is required", "password");
    }

    if (password.length < 6) {
      throw new ValidationError("Password must be at least 6 characters", "password");
    }

    if (password.length > 100) {
      throw new ValidationError("Password too long (max 100 characters)", "password");
    }

    // Check for common weak passwords
    const weakPasswords = ['123456', 'password', 'qwerty', 'abc123'];
    if (weakPasswords.includes(password.toLowerCase())) {
      throw new ValidationError("Password is too weak", "password");
    }

    return password;
  },

  // Country validation
  country(country, validCountries = null) {
    if (!country || typeof country !== 'string') {
      throw new ValidationError("Country is required", "country");
    }

    const trimmed = country.trim();

    if (trimmed.length === 0) {
      throw new ValidationError("Country cannot be empty", "country");
    }

    if (trimmed.length > 100) {
      throw new ValidationError("Country name too long", "country");
    }

    // If list of valid countries provided, check against it
    if (validCountries && Array.isArray(validCountries)) {
      if (!validCountries.includes(trimmed)) {
        throw new ValidationError("Invalid country selected", "country");
      }
    }

    return this.sanitizeString(trimmed);
  },

  // Manager/Person name validation
  managerName(name) {
    if (!name || typeof name !== 'string') {
      throw new ValidationError("Manager name is required", "manager");
    }

    const trimmed = name.trim();

    if (trimmed.length === 0) {
      throw new ValidationError("Manager name cannot be empty", "manager");
    }

    if (trimmed.length < 2) {
      throw new ValidationError("Manager name too short", "manager");
    }

    if (trimmed.length > 100) {
      throw new ValidationError("Manager name too long (max 100 characters)", "manager");
    }

    // Check for valid characters (letters, spaces, hyphens, apostrophes)
    const nameRegex = /^[a-zA-Z\s\-']+$/;
    if (!nameRegex.test(trimmed)) {
      throw new ValidationError("Manager name contains invalid characters", "manager");
    }

    return this.sanitizeString(trimmed);
  },

  // Match ID validation
  matchId(matchId) {
    if (!matchId || typeof matchId !== 'string') {
      throw new ValidationError("Match ID is required", "matchId");
    }

    const validIds = /^(QF[1-4]|SF[1-2]|FINAL)$/;
    const upper = matchId.toUpperCase();

    if (!validIds.test(upper)) {
      throw new ValidationError("Invalid match ID format", "matchId");
    }

    return upper;
  },

  // Generic string sanitization - Remove HTML/Script tags
  sanitizeString(input) {
    if (typeof input !== 'string') return '';
    
    return input
      .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove script tags
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/[<>]/g, '') // Remove remaining < and >
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .trim();
  },

  // Numeric validation
  number(value, min = null, max = null) {
    const num = Number(value);

    if (isNaN(num)) {
      throw new ValidationError("Value must be a number", "number");
    }

    if (min !== null && num < min) {
      throw new ValidationError(`Value must be at least ${min}`, "number");
    }

    if (max !== null && num > max) {
      throw new ValidationError(`Value must not exceed ${max}`, "number");
    }

    return num;
  },

  // Boolean validation
  boolean(value) {
    if (typeof value === 'boolean') return value;
    if (value === 'true' || value === '1') return true;
    if (value === 'false' || value === '0') return false;
    throw new ValidationError("Value must be a boolean", "boolean");
  },

  // Array validation
  array(value, minLength = null, maxLength = null) {
    if (!Array.isArray(value)) {
      throw new ValidationError("Value must be an array", "array");
    }

    if (minLength !== null && value.length < minLength) {
      throw new ValidationError(`Array must have at least ${minLength} items`, "array");
    }

    if (maxLength !== null && value.length > maxLength) {
      throw new ValidationError(`Array must not exceed ${maxLength} items`, "array");
    }

    return value;
  }
};

// Validation helper for team creation
export function validateTeamData(country, manager) {
  const errors = [];

  try {
    Validators.country(country);
  } catch (e) {
    errors.push(e.message);
  }

  try {
    Validators.managerName(manager);
  } catch (e) {
    errors.push(e.message);
  }

  if (errors.length > 0) {
    throw new ValidationError(errors.join('; '));
  }

  return {
    country: Validators.country(country),
    manager: Validators.managerName(manager)
  };
}

// Validation helper for match simulation
export function validateMatchData(matchId) {
  return {
    matchId: Validators.matchId(matchId)
  };
}