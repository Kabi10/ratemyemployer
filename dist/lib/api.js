"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchData = void 0;
// Create a centralized API handling
async function fetchData(query) {
    try {
        const { data, error } = await query;
        if (error)
            throw error;
        return { data, error: null };
    }
    catch (error) {
        console.error('API Error:', error);
        return { data: null, error: error };
    }
}
exports.fetchData = fetchData;
