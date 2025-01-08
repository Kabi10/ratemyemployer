"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serverQuery = exports.createServerSupabase = exports.createServerClient = void 0;
const ssr_1 = require("@supabase/ssr");
Object.defineProperty(exports, "createServerClient", { enumerable: true, get: function () { return ssr_1.createServerClient; } });
const headers_1 = require("next/headers");
const createServerSupabase = async () => {
    return (0, ssr_1.createServerClient)(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
        cookies: {
            async get(name) {
                var _a;
                const cookieStore = await (0, headers_1.cookies)();
                return (_a = cookieStore.get(name)) === null || _a === void 0 ? void 0 : _a.value;
            },
            async set(name, value, options) {
                const cookieStore = await (0, headers_1.cookies)();
                cookieStore.set(Object.assign({ name, value }, options));
            },
            async remove(name, options) {
                const cookieStore = await (0, headers_1.cookies)();
                cookieStore.delete(Object.assign({ name }, options));
            }
        }
    });
};
exports.createServerSupabase = createServerSupabase;
// Server-side database queries
exports.serverQuery = {
    companies: {
        getAll: async () => {
            const supabase = await (0, exports.createServerSupabase)();
            return supabase
                .from('companies')
                .select('*')
                .order('created_at', { ascending: false });
        },
        getById: async (id) => {
            const supabase = await (0, exports.createServerSupabase)();
            return supabase
                .from('companies')
                .select('*')
                .eq('id', id)
                .single();
        }
    },
    reviews: {
        getAll: async () => {
            const supabase = await (0, exports.createServerSupabase)();
            return supabase
                .from('reviews')
                .select('*, companies(*)')
                .order('created_at', { ascending: false });
        },
        getPending: async () => {
            const supabase = await (0, exports.createServerSupabase)();
            return supabase
                .from('reviews')
                .select('*, companies(*)')
                .eq('status', 'pending')
                .order('created_at', { ascending: false });
        }
    }
};
