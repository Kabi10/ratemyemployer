"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const server_1 = require("next/server");
async function GET() {
    const supabase = (0, supabase_js_1.createClient)(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    try {
        // Test queries
        const [companiesResponse, reviewsResponse] = await Promise.all([
            supabase.from('companies').select('*').limit(1),
            supabase.from('reviews').select('*').limit(1),
        ]);
        return server_1.NextResponse.json({
            success: true,
            message: 'Successfully connected to Supabase',
            data: {
                companies: companiesResponse.data,
                reviews: reviewsResponse.data,
                errors: {
                    companies: companiesResponse.error,
                    reviews: reviewsResponse.error,
                },
            },
        });
    }
    catch (error) {
        return server_1.NextResponse.json({
            success: false,
            message: 'Failed to connect to Supabase',
            error: error instanceof Error ? error.message : 'Unknown error',
        }, { status: 500 });
    }
}
exports.GET = GET;
