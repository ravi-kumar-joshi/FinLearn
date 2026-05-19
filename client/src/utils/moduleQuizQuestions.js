/**
 * Collect MCQ rows from each lesson under a module (matches server Course schema).
 */
export function collectModuleQuizQuestions(module) {
    if (!module?.lessons?.length) return [];
    const list = [];
    let n = 0;
    for (const lesson of module.lessons) {
        const qs = lesson.quiz?.questions;
        if (!qs?.length) continue;
        for (const q of qs) {
            list.push({
                id: q.id ?? `q-${n}`,
                question: q.question,
                options: Array.isArray(q.options) ? q.options : [],
                correctAnswer:
                    typeof q.correctAnswer === 'number'
                        ? q.correctAnswer
                        : Number(q.correctAnswer) || 0,
                explanation: q.explanation ?? '',
                timeLimit: q.timeLimit,
            });
            n += 1;
        }
    }
    return list;
}
