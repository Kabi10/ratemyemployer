"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useReviews = void 0;
const react_1 = require("react");
const supabaseClient_1 = require("@/lib/supabaseClient");
const AuthContext_1 = require("@/contexts/AuthContext");
function useReviews() {
    const { user } = (0, AuthContext_1.useAuth)();
    const [reviews, setReviews] = (0, react_1.useState)(null);
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    const fetchReviews = (0, react_1.useCallback)(async () => {
        if (!user) {
            setReviews(null);
            setIsLoading(false);
            return;
        }
        try {
            const supabase = (0, supabaseClient_1.createClient)();
            const { data, error: supabaseError } = await supabase
                .from('reviews')
                .select(`
          *,
          company:companies (
            id,
            name,
            industry,
            location
          )
        `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });
            if (supabaseError)
                throw supabaseError;
            setReviews(data);
        }
        catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to fetch reviews'));
        }
        finally {
            setIsLoading(false);
        }
    }, [user]);
    (0, react_1.useEffect)(() => {
        fetchReviews();
    }, [fetchReviews]);
    return {
        reviews,
        isLoading,
        error,
        mutate: fetchReviews
    };
}
exports.useReviews = useReviews;
