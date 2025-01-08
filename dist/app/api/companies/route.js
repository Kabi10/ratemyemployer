"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = void 0;
const ssr_1 = require("@supabase/ssr");
const headers_1 = require("next/headers");
const server_1 = require("next/server");
// Helper function to create Supabase client
const createClient = async () => {
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
async function GET(request) {
    const supabase = await createClient();
    const searchParams = new URL(request.url).searchParams;
    const search = searchParams.get('search');
    const industry = searchParams.get('industry');
    const minRating = searchParams.get('minRating');
    let query = supabase.from('companies').select('*');
    if (search) {
        query = query.ilike('name', `%${search}%`);
    }
    if (industry) {
        query = query.eq('industry', industry);
    }
    if (minRating) {
        query = query.gte('average_rating', minRating);
    }
    const { data, error } = await query;
    if (error) {
        return server_1.NextResponse.json({ error: error.message }, { status: 500 });
    }
    return server_1.NextResponse.json(data);
}
exports.GET = GET;
