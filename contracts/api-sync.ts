/**
 * @license
 * SPDX-License-Identifier: MIT
 */

/**
 * @file contracts/api-sync.ts
 * @description Contratos de payload para sincronizacao de shards no endpoint /api/sync.
 */

export type EncryptedShardMap = Record<string, string>;

export const SYNC_MAX_SHARDS_PER_REQUEST = 256;
export const SYNC_MAX_SHARD_VALUE_BYTES = 512 * 1024;
export const SYNC_MAX_TOTAL_SHARDS_BYTES = 4 * 1024 * 1024;
export const SYNC_MAX_REQUEST_BODY_BYTES = 5 * 1024 * 1024;

export type SyncPostRequest = {
    lastModified: number;
    shards: EncryptedShardMap;
};

export type SyncServerShards = EncryptedShardMap & {
    lastModified?: string;
};

export type SyncPostResponse = {
    fallback?: boolean;
};

type SyncRequestValidationSuccess = {
    ok: true;
    value: SyncPostRequest;
};

type SyncRequestValidationFailure = {
    ok: false;
    error: string;
    code: 'INVALID_JSON' | 'INVALID_TS' | 'INVALID_SHARDS' | 'SHARD_LIMIT_EXCEEDED' | 'INVALID_SHARD_TYPE';
    detail?: string;
    detailType?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isEncryptedShardMap(value: unknown): value is EncryptedShardMap {
    if (!isRecord(value)) return false;
    return Object.values(value).every((entry) => typeof entry === 'string');
}

export function createSyncPostRequest(lastModified: number, shards: EncryptedShardMap): SyncPostRequest {
    return { lastModified, shards };
}

export function validateSyncPostRequest(value: unknown): SyncRequestValidationSuccess | SyncRequestValidationFailure {
    if (!isRecord(value)) {
        return { ok: false, error: 'Invalid JSON', code: 'INVALID_JSON' };
    }

    const rawLastModified = value.lastModified;
    const lastModified = Number(rawLastModified);
    if (!Number.isFinite(lastModified)) {
        return { ok: false, error: 'Invalid lastModified', code: 'INVALID_TS' };
    }

    const shards = value.shards;
    if (!isRecord(shards)) {
        return { ok: false, error: 'Invalid or missing shards', code: 'INVALID_SHARDS' };
    }

    const shardEntries = Object.entries(shards);
    if (shardEntries.length > SYNC_MAX_SHARDS_PER_REQUEST) {
        return { ok: false, error: 'Too many shards', code: 'SHARD_LIMIT_EXCEEDED' };
    }

    for (const [shardName, shardValue] of shardEntries) {
        if (typeof shardValue !== 'string') {
            return {
                ok: false,
                error: 'Invalid shard type',
                code: 'INVALID_SHARD_TYPE',
                detail: shardName,
                detailType: typeof shardValue
            };
        }
    }

    return {
        ok: true,
        value: {
            lastModified,
            shards: shards as EncryptedShardMap
        }
    };
}

export function isSyncServerShards(value: unknown): value is SyncServerShards {
    if (!isRecord(value)) return false;
    return Object.values(value).every((entry) => typeof entry === 'string');
}

export function parseSyncServerShards(value: unknown): SyncServerShards | null {
    return isSyncServerShards(value) ? value : null;
}

export function normalizeSyncPostResponse(value: unknown): SyncPostResponse {
    if (!isRecord(value)) return {};
    if (value.fallback !== undefined && typeof value.fallback !== 'boolean') return {};
    return value as SyncPostResponse;
}
