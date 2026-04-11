export function trimString(value: unknown): unknown {
    if (typeof value !== 'string') return value;
    return value.trim();
}

export function trimLowercase(value: unknown): unknown {
    if (typeof value !== 'string') return value;
    return value.trim().toLowerCase();
}

export function toBoolean(value: unknown): unknown {
    if (typeof value !== 'string') return value;
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true') return true;
    if (normalized === 'false') return false;
    return value;
}
