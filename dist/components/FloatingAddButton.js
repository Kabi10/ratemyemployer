"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.FloatingAddButton = void 0;
const react_1 = require("react");
const outline_1 = require("@heroicons/react/24/outline");
const CompanyForm_1 = require("@/components/CompanyForm");
function FloatingAddButton() {
    const [isOpen, setIsOpen] = (0, react_1.useState)(false);
    return (<>
      <button onClick={() => setIsOpen(true)} className="fixed bottom-20 right-8 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition-colors z-40">
        Add Company
      </button>

      {isOpen && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
            <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <outline_1.XMarkIcon className="w-6 h-6"/>
            </button>
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Add New Company</h2>
              <CompanyForm_1.CompanyForm onSuccess={() => setIsOpen(false)}/>
            </div>
          </div>
        </div>)}
    </>);
}
exports.FloatingAddButton = FloatingAddButton;
