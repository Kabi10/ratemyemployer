"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatCard = void 0;
function StatCard({ label, value, type }) {
    const formattedValue = type === 'rating' && typeof value === 'number' ? value.toFixed(1) : value;
    return (<div className="bg-white rounded-lg shadow p-4">
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-2xl font-bold">
        {formattedValue}
        {type === 'rating' && ' / 5'}
      </p>
    </div>);
}
exports.StatCard = StatCard;
