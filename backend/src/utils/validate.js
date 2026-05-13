export const TODO_LIST_RULES = [
  {
    field: "title",
    type: "string",
    required: true,
    maxLength: 200,
  },
  {
    field: "description",
    type: "string",
    required: false,
    maxLength: 1000,
  },
  {
    field: "completed",
    type: "boolean",
    required: false,
  },
  {
    field: "priority",
    type: "string",
    required: false,
    allowedValues: ["low", "medium", "high", "urgent"],
  },
  {
    field: "category",
    type: "string",
    required: false,
    allowedValues: [
      "work",
      "personal",
      "shopping",
      "health",
      "education",
      "community",
      "public-service",
    ],
  },
  {
    field: "dueDate",
    type: "string",
    required: false,
    isDate: true,
  },
];

export function validateTodoData(data, isUpdate = false) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error(
      "Precondition violated: request body must be a non-null object",
    );
  }

  const errors = [];

  for (const rule of TODO_LIST_RULES) {
    const value = data[rule.field];

    const fieldPresent = value !== undefined && value !== null && value !== "";

    if (!isUpdate && rule.required && !fieldPresent) {
      errors.push(`Field '${rule.field}' is required`);
      continue;
    }

    if (!fieldPresent) continue;

    if (rule.type === "boolean") {
      if (typeof value !== "boolean") {
        errors.push(`Field '${rule.field}' must be a boolean (true/false)`);
        continue;
      }
    } else if (rule.type === "string") {
      if (typeof value !== "string") {
        errors.push(`Field '${rule.field}' must be a string`);
        continue;
      }
      if (rule.maxLength && value.length > rule.maxLength) {
        errors.push(
          `Field '${rule.field}' must not exceed ${rule.maxLength} characters`,
        );
      }
      if (rule.allowedValues && !rule.allowedValues.includes(value)) {
        errors.push(
          `Field '${rule.field}' must be one of: ${rule.allowedValues.join(", ")}`,
        );
      }
      if (rule.isDate) {
        const parsed = Date.parse(value);
        if (isNaN(parsed)) {
          errors.push(`Field '${rule.field}' must be a valid ISO date string`);
        }
      }
    }
  }

  if (errors.length > 0) {
    const err = new Error("Validation failed: " + errors.join("; "));
    err.statusCode = 400;
    err.validationErrors = errors;
    throw err;
  }

  return true;
}

export function validateId(id) {
  if (!id || typeof id !== "string" || id.trim().length === 0) {
    const err = new Error(
      "Precondition violated: 'id' parameter must be a non-empty string",
    );
    err.statusCode = 400;
    throw err;
  }

  if (id.length > 1500) {
    const err = new Error("Precondition violated: 'id' parameter is too long");
    err.statusCode = 400;
    throw err;
  }

  return true;
}
