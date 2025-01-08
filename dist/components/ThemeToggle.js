"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
const next_themes_1 = require("next-themes");
const lucide_react_1 = require("lucide-react");
const react_1 = require("react");
function ThemeToggle() {
    const { theme, setTheme } = (0, next_themes_1.useTheme)();
    const [mounted, setMounted] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        setMounted(true);
    }, []);
    if (!mounted) {
        return null;
    }
    return (<button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="fixed bottom-6 right-6 p-2 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 z-50 border border-gray-200 dark:border-gray-700" title="Toggle theme">
      {theme === 'dark' ? (<lucide_react_1.Sun className="w-5 h-5 text-gray-600 dark:text-gray-300"/>) : (<lucide_react_1.Moon className="w-5 h-5 text-gray-600 dark:text-gray-300"/>)}
    </button>);
}
exports.default = ThemeToggle;
