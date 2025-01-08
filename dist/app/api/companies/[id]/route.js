"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DELETE = exports.PUT = exports.GET = void 0;
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
    const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', params.id)
        .single();
    if (error) {
        return server_1.NextResponse.json({ error: error.message }, { status: 500 });
    }
    return server_1.NextResponse.json(data);
}
exports.GET = GET;
async function PUT(request, { params }) {
    const supabase = createClient();
    const updates = await request.json();
    const { data, error } = await supabase
        .from('companies')
        .update(updates)
        .eq('id', params.id)
        .select()
        .single();
    if (error) {
        return server_1.NextResponse.json({ error: error.message }, { status: 500 });
    }
    return server_1.NextResponse.json(data);
}
exports.PUT = PUT;
async function DELETE(request, { params }) {
    const supabase = createClient();
    const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', params.id);
    if (error) {
        return server_1.NextResponse.json({ error: error.message }, { status: 500 });
    }
    return server_1.NextResponse.json({ success: true });
}
exports.DELETE = DELETE;
