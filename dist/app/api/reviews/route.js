"use strict";
/**
 * src/app/api/reviews/route.ts
 * API routes for handling review creation and updates
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DELETE = exports.POST = exports.GET = void 0;
const ssr_1 = require("@supabase/ssr");
const headers_1 = require("next/headers");
const server_1 = require("next/server");
async function GET() {
    try {
        const cookieStore = (0, headers_1.cookies)();
        const supabase = (0, ssr_1.createServerClient)(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
            cookies: {
                get(name) {
                    var _a;
                    return (_a = cookieStore.get(name)) === null || _a === void 0 ? void 0 : _a.value;
                },
            },
        });
        const { data: reviews, error } = await supabase
            .from('reviews')
            .select('*, company:companies(*)')
            .order('created_at', { ascending: false });
        if (error) {
            return server_1.NextResponse.json({ error: error.message }, { status: 500 });
        }
        return server_1.NextResponse.json(reviews);
    }
    catch (error) {
        return server_1.NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
exports.GET = GET;
async function POST(request) {
    try {
        const cookieStore = (0, headers_1.cookies)();
        const supabase = (0, ssr_1.createServerClient)(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
            cookies: {
                get(name) {
                    var _a;
                    return (_a = cookieStore.get(name)) === null || _a === void 0 ? void 0 : _a.value;
                },
            },
        });
        const review = (await request.json());
        const { data, error } = await supabase
            .from('reviews')
            .insert([review])
            .select()
            .single();
        if (error) {
            return server_1.NextResponse.json({ error: error.message }, { status: 500 });
        }
        return server_1.NextResponse.json(data);
    }
    catch (error) {
        return server_1.NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
exports.POST = POST;
async function DELETE(request) {
    try {
        const cookieStore = (0, headers_1.cookies)();
        const supabase = (0, ssr_1.createServerClient)(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
            cookies: {
                get(name) {
                    var _a;
                    return (_a = cookieStore.get(name)) === null || _a === void 0 ? void 0 : _a.value;
                },
            },
        });
        const { id } = await request.json();
        const { error } = await supabase.from('reviews').delete().eq('id', id);
        if (error) {
            return server_1.NextResponse.json({ error: error.message }, { status: 500 });
        }
        return server_1.NextResponse.json({ message: 'Review deleted successfully' });
    }
    catch (error) {
        return server_1.NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
exports.DELETE = DELETE;
