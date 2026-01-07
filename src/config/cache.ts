import NodeCache from 'node-cache';

// Initialize cache with 5-minute default TTL and check period of 120 seconds
export const cache = new NodeCache({
    stdTTL: 300, // 5 minutes default
    checkperiod: 120, // Check for expired keys every 2 minutes
    useClones: false, // Better performance, but be careful with object references
});

// Cache keys constants
export const CACHE_KEYS = {
    CLASSES: 'classes',
    CLASSES_BY_AGE: (age: number) => `classes_age_${age}`,
    TEACHERS: 'teachers',
    TEACHER: (id: string) => `teacher_${id}`,
    STATS: 'admin_stats',
    PRICING_PLANS: 'pricing_plans',
};

// Cache helper functions
export function getCached<T>(key: string): T | undefined {
    return cache.get<T>(key);
}

export function setCache<T>(key: string, value: T, ttl?: number): boolean {
    if (ttl) {
        return cache.set(key, value, ttl);
    }
    return cache.set(key, value);
}

export function deleteCache(key: string): number {
    return cache.del(key);
}

export function flushCache(): void {
    cache.flushAll();
}

// Invalidate all class-related cache
export function invalidateClassCache(): void {
    const keys = cache.keys();
    keys.forEach((key) => {
        if (key.startsWith('classes')) {
            cache.del(key);
        }
    });
}

// Invalidate teacher cache
export function invalidateTeacherCache(): void {
    const keys = cache.keys();
    keys.forEach((key) => {
        if (key.startsWith('teacher')) {
            cache.del(key);
        }
    });
}

// Cache stats for monitoring
export function getCacheStats() {
    return cache.getStats();
}

// Decorator-style caching function
export async function withCache<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl?: number
): Promise<T> {
    const cached = getCached<T>(key);

    if (cached !== undefined) {
        return cached;
    }

    const fresh = await fetchFn();
    setCache(key, fresh, ttl);
    return fresh;
}
