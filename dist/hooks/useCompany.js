"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useCompanies = exports.useCompany = void 0;
const swr_1 = __importDefault(require("swr"));
const supabaseClient_1 = require("@/lib/supabaseClient");
const fetcher = async (key, id, options = {}) => {
    const supabase = (0, supabaseClient_1.createClient)();
    const query = supabase.from('companies');
    if (options.withReviews) {
        const { data, error } = await query
            .select(`
        *,
        reviews!inner (
          id,
          title,
          content,
          rating,
          pros,
          cons,
          position,
          employment_status,
          company_id,
          created_at,
          updated_at,
          user_id,
          likes,
          status,
          is_current_employee,
          reviewer_email,
          reviewer_name
        )
      `)
            .eq('id', id)
            .single();
        if (error)
            throw error;
        return data;
    }
    else {
        const { data, error } = await query.select('*').eq('id', id).single();
        if (error)
            throw error;
        if (options.withStats && data) {
            const { data: reviewStats, error: statsError } = await supabase
                .from('reviews')
                .select('rating')
                .eq('company_id', id);
            if (statsError)
                throw statsError;
            const totalReviews = (reviewStats === null || reviewStats === void 0 ? void 0 : reviewStats.length) || 0;
            const averageRating = totalReviews && reviewStats
                ? reviewStats.reduce((acc, review) => { var _a; return acc + ((_a = review.rating) !== null && _a !== void 0 ? _a : 0); }, 0) / totalReviews
                : 0;
            return Object.assign(Object.assign({}, data), { stats: {
                    totalReviews,
                    averageRating,
                } });
        }
        return data;
    }
};
function useCompany(id, options = {}) {
    const { data, error, isLoading, mutate } = (0, swr_1.default)(id ? ['company', id.toString(), options] : null, ([_, companyId, opts]) => fetcher('company', companyId, opts), {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
    });
    return {
        company: data || null,
        isLoading,
        error,
        mutate,
    };
}
exports.useCompany = useCompany;
const companiesListFetcher = async (key, { limit = 10, offset = 0, searchQuery = '', industry = '', location = '', withStats = false, withReviews = false }) => {
    const supabase = (0, supabaseClient_1.createClient)();
    const query = supabase.from('companies');
    // Apply filters
    let filtered = query.select(withReviews
        ? `
        *,
        reviews (
          *
        )
      `
        : '*', { count: 'exact' });
    if (searchQuery) {
        filtered = filtered.ilike('name', `%${searchQuery}%`);
    }
    if (industry) {
        filtered = filtered.eq('industry', industry);
    }
    if (location) {
        filtered = filtered.eq('location', location);
    }
    // Apply pagination
    const { data, error, count } = await filtered.range(offset, offset + limit - 1).order('name');
    if (error)
        throw error;
    if (withStats && data) {
        // Fetch stats for all companies in parallel
        const companiesWithStats = await Promise.all(data.map(async (company) => {
            const { data: reviewStats } = await supabase
                .from('reviews')
                .select('rating')
                .eq('company_id', company.id);
            const totalReviews = (reviewStats === null || reviewStats === void 0 ? void 0 : reviewStats.length) || 0;
            const averageRating = totalReviews && reviewStats
                ? reviewStats.reduce((acc, review) => { var _a; return acc + ((_a = review.rating) !== null && _a !== void 0 ? _a : 0); }, 0) / totalReviews
                : 0;
            return Object.assign(Object.assign({}, company), { stats: {
                    totalReviews,
                    averageRating,
                } });
        }));
        return {
            companies: companiesWithStats,
            count: count || 0,
        };
    }
    return {
        companies: data,
        count: count || 0,
    };
};
function useCompanies(options = {}) {
    const { data, error, isLoading, mutate } = (0, swr_1.default)(['companies', options], ([_, opts]) => companiesListFetcher('companies', opts), {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
    });
    return {
        companies: (data === null || data === void 0 ? void 0 : data.companies) || [],
        totalCount: (data === null || data === void 0 ? void 0 : data.count) || 0,
        isLoading,
        error,
        mutate,
    };
}
exports.useCompanies = useCompanies;
