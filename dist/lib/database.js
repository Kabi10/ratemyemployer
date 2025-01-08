"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteReview = exports.updateReview = exports.createReview = exports.deleteCompany = exports.updateCompany = exports.createCompany = exports.deleteLike = exports.updateLike = exports.createLike = exports.getLikes = exports.getReview = exports.getReviews = exports.getCompany = exports.getCompanies = exports.supabase = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
exports.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
async function getCompanies() {
    const { data, error } = await exports.supabase
        .from('companies')
        .select('*');
    return { data, error };
}
exports.getCompanies = getCompanies;
async function getCompany(id) {
    const { data, error } = await exports.supabase
        .from('companies')
        .select('*')
        .eq('id', id)
        .single();
    return { data, error };
}
exports.getCompany = getCompany;
async function getReviews(companyId) {
    const query = exports.supabase
        .from('reviews')
        .select('*, company:companies(*)');
    if (companyId) {
        query.eq('company_id', companyId);
    }
    const { data, error } = await query;
    return { data, error };
}
exports.getReviews = getReviews;
async function getReview(id) {
    const { data, error } = await exports.supabase
        .from('reviews')
        .select('*, company:companies(*)')
        .eq('id', id)
        .single();
    return { data, error };
}
exports.getReview = getReview;
async function getLikes(reviewId, userId) {
    const { data, error } = await exports.supabase
        .from('review_likes')
        .select('*')
        .eq('review_id', reviewId)
        .eq('user_id', userId)
        .single();
    return {
        data: data,
        error
    };
}
exports.getLikes = getLikes;
async function createLike(data) {
    const { error } = await exports.supabase
        .from('review_likes')
        .insert([{
            id: data.id,
            review_id: data.review_id,
            user_id: data.user_id,
            created_at: new Date().toISOString(),
            liked: data.liked
        }]);
    return { error };
}
exports.createLike = createLike;
async function updateLike(data) {
    const { error } = await exports.supabase
        .from('review_likes')
        .update({
        id: data.id,
        review_id: data.review_id,
        user_id: data.user_id,
        created_at: new Date().toISOString(),
        liked: data.liked
    })
        .eq('id', data.id);
    return { error };
}
exports.updateLike = updateLike;
async function deleteLike(id) {
    const { error } = await exports.supabase
        .from('review_likes')
        .delete()
        .eq('id', id);
    return { error };
}
exports.deleteLike = deleteLike;
async function createCompany(data) {
    const { error } = await exports.supabase
        .from('companies')
        .insert([data]);
    return { error };
}
exports.createCompany = createCompany;
async function updateCompany(id, data) {
    const { error } = await exports.supabase
        .from('companies')
        .update(data)
        .eq('id', id);
    return { error };
}
exports.updateCompany = updateCompany;
async function deleteCompany(id) {
    const { error } = await exports.supabase
        .from('companies')
        .delete()
        .eq('id', id);
    return { error };
}
exports.deleteCompany = deleteCompany;
async function createReview(data) {
    const { error } = await exports.supabase
        .from('reviews')
        .insert([data]);
    return { error };
}
exports.createReview = createReview;
async function updateReview(id, data) {
    const { error } = await exports.supabase
        .from('reviews')
        .update(data)
        .eq('id', id);
    return { error };
}
exports.updateReview = updateReview;
async function deleteReview(id) {
    const { error } = await exports.supabase
        .from('reviews')
        .delete()
        .eq('id', id);
    return { error };
}
exports.deleteReview = deleteReview;
