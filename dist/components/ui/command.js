"use strict";
"use client";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandSeparator = exports.CommandShortcut = exports.CommandItem = exports.CommandGroup = exports.CommandEmpty = exports.CommandList = exports.CommandInput = exports.CommandDialog = exports.Command = void 0;
const React = __importStar(require("react"));
const cmdk_1 = require("cmdk");
const react_dialog_1 = require("@radix-ui/react-dialog");
const utils_1 = require("@/lib/utils");
const Command = React.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<cmdk_1.Command ref={ref} className={(0, utils_1.cn)("flex h-full w-full flex-col overflow-hidden rounded-md bg-white dark:bg-gray-800", className)} {...props}/>);
});
exports.Command = Command;
Command.displayName = cmdk_1.Command.displayName;
const CommandDialog = (_a) => {
    var { children } = _a, props = __rest(_a, ["children"]);
    return (<react_dialog_1.Dialog {...props}>
      <react_dialog_1.DialogContent className="overflow-hidden p-0">
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-gray-500 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          {children}
        </Command>
      </react_dialog_1.DialogContent>
    </react_dialog_1.Dialog>);
};
exports.CommandDialog = CommandDialog;
const CommandInput = React.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<div className="flex items-center border-b px-3" cmdk-input-wrapper="">
    <cmdk_1.Command.Input ref={ref} className={(0, utils_1.cn)("flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-gray-500 disabled:cursor-not-allowed disabled:opacity-50 dark:text-white", className)} {...props}/>
  </div>);
});
exports.CommandInput = CommandInput;
CommandInput.displayName = cmdk_1.Command.Input.displayName;
const CommandList = React.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<cmdk_1.Command.List ref={ref} className={(0, utils_1.cn)("max-h-[300px] overflow-y-auto overflow-x-hidden", className)} {...props}/>);
});
exports.CommandList = CommandList;
CommandList.displayName = cmdk_1.Command.List.displayName;
const CommandEmpty = React.forwardRef((props, ref) => (<cmdk_1.Command.Empty ref={ref} className="py-6 text-center text-sm text-gray-500" {...props}/>));
exports.CommandEmpty = CommandEmpty;
CommandEmpty.displayName = cmdk_1.Command.Empty.displayName;
const CommandGroup = React.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<cmdk_1.Command.Group ref={ref} className={(0, utils_1.cn)("overflow-hidden p-1 text-gray-700 dark:text-gray-400 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-gray-500", className)} {...props}/>);
});
exports.CommandGroup = CommandGroup;
CommandGroup.displayName = cmdk_1.Command.Group.displayName;
const CommandSeparator = React.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<cmdk_1.Command.Separator ref={ref} className={(0, utils_1.cn)("-mx-1 h-px bg-gray-200 dark:bg-gray-800", className)} {...props}/>);
});
exports.CommandSeparator = CommandSeparator;
CommandSeparator.displayName = cmdk_1.Command.Separator.displayName;
const CommandItem = React.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<cmdk_1.Command.Item ref={ref} className={(0, utils_1.cn)("relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-gray-100 aria-selected:text-gray-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 dark:aria-selected:bg-gray-800 dark:aria-selected:text-white", className)} {...props}/>);
});
exports.CommandItem = CommandItem;
CommandItem.displayName = cmdk_1.Command.Item.displayName;
const CommandShortcut = (_a) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<span className={(0, utils_1.cn)("ml-auto text-xs tracking-widest text-gray-500", className)} {...props}/>);
};
exports.CommandShortcut = CommandShortcut;
CommandShortcut.displayName = "CommandShortcut";
