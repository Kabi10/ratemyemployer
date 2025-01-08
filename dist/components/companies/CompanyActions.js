"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const link_1 = __importDefault(require("next/link"));
function CompanyActions({ company }) {
    return (<div className="p-4 flex justify-between">
      <link_1.default href={`/companies/${company.id}`} className="text-blue-600 hover:text-blue-800">
        View Details
      </link_1.default>
      <link_1.default href={`/reviews/new?company=${company.id}`} className="text-green-600 hover:text-green-800">
        Write Review
      </link_1.default>
    </div>);
}
exports.default = CompanyActions;
