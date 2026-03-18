/**
 * @license
 * SPDX-License-Identifier: MIT
 */

/**
 * @file contracts/api-analyze.ts
 * @description Contratos compartilhados para requests/respostas do endpoint /api/analyze.
 */

export type AnalyzeRequest = {
    prompt: string;
    systemInstruction: string;
};

export type AnalyzeErrorResponse = {
    error: string;
    details?: string;
    code?: string;
};

export type AnalyzeDailyDiagnosisResponse = {
    analysis: {
        determined_level: 1 | 2 | 3;
    };
    relevant_themes: string[];
};

type AnalyzeRequestValidationSuccess = {
    ok: true;
    value: AnalyzeRequest;
};

type AnalyzeRequestValidationFailure = {
    ok: false;
    error: string;
    code: 'INVALID_ANALYZE_REQUEST';
};

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function createAnalyzeRequest(prompt: string, systemInstruction: string): AnalyzeRequest {
    return { prompt, systemInstruction };
}

export function validateAnalyzeRequest(value: unknown): AnalyzeRequestValidationSuccess | AnalyzeRequestValidationFailure {
    if (!isRecord(value)) {
        return { ok: false, error: 'Invalid analyze request payload', code: 'INVALID_ANALYZE_REQUEST' };
    }

    const prompt = typeof value.prompt === 'string' ? value.prompt.trim() : '';
    const systemInstruction = typeof value.systemInstruction === 'string' ? value.systemInstruction.trim() : '';

    if (!prompt || !systemInstruction) {
        return { ok: false, error: 'Invalid analyze request payload', code: 'INVALID_ANALYZE_REQUEST' };
    }

    return {
        ok: true,
        value: {
            prompt,
            systemInstruction
        }
    };
}

export function isAnalyzeDailyDiagnosisResponse(value: unknown): value is AnalyzeDailyDiagnosisResponse {
    if (!isRecord(value)) return false;
    if (!isRecord(value.analysis)) return false;
    const level = value.analysis.determined_level;
    if (level !== 1 && level !== 2 && level !== 3) return false;
    if (!Array.isArray(value.relevant_themes)) return false;
    return value.relevant_themes.every((theme) => typeof theme === 'string');
}

export function parseAnalyzeDailyDiagnosisText(rawText: string): AnalyzeDailyDiagnosisResponse | null {
    const jsonStr = rawText.replace(/```json|```/g, '').trim();
    if (!jsonStr) return null;

    try {
        const parsed = JSON.parse(jsonStr);
        return isAnalyzeDailyDiagnosisResponse(parsed) ? parsed : null;
    } catch {
        return null;
    }
}