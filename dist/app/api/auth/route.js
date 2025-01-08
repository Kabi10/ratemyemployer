"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = exports.DELETE = exports.POST = void 0;
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
            async remove(name, _options) {
                const cookieStore = await (0, headers_1.cookies)();
                cookieStore.delete(name);
            }
        }
    });
};
async function POST(request) {
    const { email, password } = await request.json();
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });
    if (error) {
        return server_1.NextResponse.json({ error: error.message }, { status: 401 });
    }
    return server_1.NextResponse.json(data);
}
exports.POST = POST;
async function DELETE() {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
        return server_1.NextResponse.json({ error: error.message }, { status: 500 });
    }
    return server_1.NextResponse.json({ success: true });
}
exports.DELETE = DELETE;
async function GET() {
    const supabase = createClient();
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
        return server_1.NextResponse.json({ error: error.message }, { status: 500 });
    }
    return server_1.NextResponse.json({ session });
}
exports.GET = GET;
