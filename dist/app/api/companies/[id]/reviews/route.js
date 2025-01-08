"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = exports.GET = void 0;
const ssr_1 = require("@supabase/ssr");
const headers_1 = require("next/headers");
const server_1 = require("next/server");
// Helper function to create Supabase client
const createClient = () => {
    return (0, ssr_1.createServerClient)(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
        cookies: {
            async get(name) {
                var _a;
                const cookieStore = await (0, headers_1.cookies)();
                return (_a = cookieStore.get(name)) === null || _a === void 0 ? void 0 : _a.value;
            },
            async set(name, value, options) {
                const cookieStore = await (0, headers_1.cookies)();
                cookieStore.set(Object.assign(Object.assign({ name,
                    value }, options), { path: '/' }));
            },
            async remove(name, options) {
                const cookieStore = await (0, headers_1.cookies)();
                cookieStore.delete(name);
            }
        }
    });
};
async function GET(request, { params }) {
    const supabase = createClient();
    try {
        const { data, error } = await supabase
            .from('reviews')
            .select('*')
            .eq('company_id', params.id)
            .order('created_at', { ascending: false });
        if (error)
            throw error;
        return server_1.NextResponse.json(data);
    }
    catch (error) {
        console.error('Error fetching reviews:', error);
        return server_1.NextResponse.json({ error: 'Error fetching reviews' }, { status: 500 });
    }
}
exports.GET = GET;
async function POST(request, { params }) {
    const supabase = createClient();
    const reviewData = await request.json();
    try {
        const { data, error } = await supabase
            .from('reviews')
            .insert([Object.assign(Object.assign({}, reviewData), { company_id: params.id })])
            .select()
            .single();
        if (error)
            throw error;
        return server_1.NextResponse.json(data);
    }
    catch (error) {
        console.error('Error creating review:', error);
        return server_1.NextResponse.json({ error: 'Error creating review' }, { status: 500 });
    }
}
exports.POST = POST;
