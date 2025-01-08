"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewActions = void 0;
const react_1 = require("react");
const ssr_1 = require("@supabase/ssr");
const lucide_react_1 = require("lucide-react");
const button_1 = require("@/components/ui/button");
function ReviewActions({ reviewId, userId, initialLikes, onLikeChange }) {
    const [isLiked, setIsLiked] = (0, react_1.useState)(false);
    const [likeCount, setLikeCount] = (0, react_1.useState)(initialLikes);
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
                onLikeChange === null || onLikeChange === void 0 ? void 0 : onLikeChange(!!data);
            }
        }
        checkLikeStatus();
    }, [reviewId, userId, supabase, onLikeChange]);
    const handleLikeClick = async () => {
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
                    setLikeCount(prev => Math.max(0, prev - 1));
                    onLikeChange === null || onLikeChange === void 0 ? void 0 : onLikeChange(false);
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
                    setLikeCount(prev => prev + 1);
                    onLikeChange === null || onLikeChange === void 0 ? void 0 : onLikeChange(true);
                }
            }
        }
        finally {
            setIsLoading(false);
        }
    };
    return (<button_1.Button variant="ghost" size="sm" onClick={handleLikeClick} disabled={!userId || isLoading} className={isLiked ? 'text-red-500' : ''}>
      <lucide_react_1.Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`}/>
      <span className="ml-2">{isLiked ? 'Unlike' : 'Like'}</span>
      <span className="ml-1">({likeCount})</span>
    </button_1.Button>);
}
exports.ReviewActions = ReviewActions;
