import type { RiasecType } from '@prisma/client';

export function limitQuestionsByDepth<T extends { riasecTypeId: RiasecType }>(
    questions: T[],
    depth: number,
) {
    const safeDepth = Math.max(1, depth);
    const counts: Record<RiasecType, number> = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
    return questions.filter((q) => {
        const current = counts[q.riasecTypeId] ?? 0;
        if (current >= safeDepth) return false;
        counts[q.riasecTypeId] = current + 1;
        return true;
    });
}
