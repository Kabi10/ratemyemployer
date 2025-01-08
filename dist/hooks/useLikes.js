"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useLikes = void 0;
const react_1 = require("react");
const ssr_1 = require("@supabase/ssr");
function useLikes(reviewId, userId) {
    const [isLiked, setIsLiked] = (0, react_1.useState)(false);
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    const supabase = (0, ssr_1.createBrowserClient)(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    (0, react_1.useEffect)(() => {
        async function checkLikeStatus() {
            if (!userId)
                return;
            const { data, error } = await supabase
                .rpc('has_user_liked_review', {
                p_user_id: userId,
                p_review_id: reviewId
            });
            if (!error) {
                setIsLiked(!!data);
            }
        }
        checkLikeStatus();
    }, [reviewId, userId, supabase]);
    const toggleLike = async () => {
        if (!userId || isLoading)
            return;
        setIsLoading(true);
        try {
            if (isLiked) {
                // Unlike
                const { error } = await supabase
                    .from('review_likes')
                    .delete()
                    .eq('user_id', userId)
                    .eq('review_id', reviewId);
                if (!error) {
                    setIsLiked(false);
                }
            }
            else {
                // Like
                const { error } = await supabase
                    .from('review_likes')
                    .insert({
                    user_id: userId,
                    review_id: reviewId
                });
                if (!error) {
                    setIsLiked(true);
                }
            }
        }
        finally {
            setIsLoading(false);
        }
    };
    return {
        isLiked,
        isLoading,
        toggleLike
    };
}
exports.useLikes = useLikes;
