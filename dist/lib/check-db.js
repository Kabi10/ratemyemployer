"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const supabaseClient_1 = require("./supabaseClient");
async function checkDatabaseSchema() {
    // Check user metadata and roles
    const { data: { users }, error: usersError } = await supabaseClient_1.supabase.auth.admin.listUsers();
    console.log('User metadata test:', {
        users: users === null || users === void 0 ? void 0 : users.map(u => ({ id: u.id, metadata: u.user_metadata })),
        error: usersError
    });
    // Check companies table
    const { data: companiesData, error: companiesError } = await supabaseClient_1.supabase
        .from('companies')
        .select('*')
        .limit(1);
    console.log('Companies table:', { companiesData, companiesError });
    // Check reviews table
    const { data: reviewsData, error: reviewsError } = await supabaseClient_1.supabase
        .from('reviews')
        .select('*')
        .limit(1);
    console.log('Reviews table:', { reviewsData, reviewsError });
    // Check auth.users table
    const { data: userData, error: userError } = await supabaseClient_1.supabase.auth.getUser();
    console.log('Auth user:', { userData, userError });
}
checkDatabaseSchema();
