"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const react_1 = require("@testing-library/react");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const CompanyCard_1 = require("@/components/CompanyCard");
// Mock company data
const mockCompany = {
    id: 1,
    name: 'Test Company',
    industry: 'Technology',
    website: 'https://test.com',
    logo_url: null,
    created_at: new Date().toISOString(),
    benefits: null,
    company_values: null,
    ceo: null,
    verification_status: 'pending',
    average_rating: 0,
    total_reviews: 0,
    description: null,
    recommendation_rate: 0,
    updated_at: new Date().toISOString(),
    created_by: null,
    verified: false,
    verification_date: null,
    location: 'Test Location',
    size: undefined
};
(0, vitest_1.describe)('RateMyEmployer App', () => {
    (0, vitest_1.describe)('UI Components', () => {
        (0, vitest_1.it)('renders button with text', () => {
            (0, react_1.render)(<button_1.Button>Click me</button_1.Button>);
            (0, vitest_1.expect)(react_1.screen.getByText('Click me')).toBeInTheDocument();
        });
        (0, vitest_1.it)('renders input with placeholder', () => {
            (0, react_1.render)(<input_1.Input placeholder="Enter text"/>);
            (0, vitest_1.expect)(react_1.screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
        });
        (0, vitest_1.it)('renders company card with basic info', () => {
            (0, react_1.render)(<CompanyCard_1.CompanyCard company={mockCompany}/>);
            (0, vitest_1.expect)(react_1.screen.getByText(mockCompany.name)).toBeInTheDocument();
        });
    });
});
