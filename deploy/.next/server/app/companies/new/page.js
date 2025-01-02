(()=>{var e={};e.id=191,e.ids=[191],e.modules={10846:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},19121:e=>{"use strict";e.exports=require("next/dist/server/app-render/action-async-storage.external.js")},3295:e=>{"use strict";e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},29294:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},63033:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},79428:e=>{"use strict";e.exports=require("buffer")},55511:e=>{"use strict";e.exports=require("crypto")},94735:e=>{"use strict";e.exports=require("events")},81630:e=>{"use strict";e.exports=require("http")},55591:e=>{"use strict";e.exports=require("https")},91645:e=>{"use strict";e.exports=require("net")},33873:e=>{"use strict";e.exports=require("path")},11997:e=>{"use strict";e.exports=require("punycode")},27910:e=>{"use strict";e.exports=require("stream")},34631:e=>{"use strict";e.exports=require("tls")},79551:e=>{"use strict";e.exports=require("url")},74075:e=>{"use strict";e.exports=require("zlib")},56003:(e,r,t)=>{"use strict";t.r(r),t.d(r,{GlobalError:()=>o.a,__next_app__:()=>u,pages:()=>c,routeModule:()=>p,tree:()=>d});var s=t(70260),a=t(28203),n=t(25155),o=t.n(n),l=t(67292),i={};for(let e in l)0>["default","tree","pages","GlobalError","__next_app__","routeModule"].indexOf(e)&&(i[e]=()=>l[e]);t.d(r,i);let d=["",{children:["companies",{children:["new",{children:["__PAGE__",{},{page:[()=>Promise.resolve().then(t.bind(t,25220)),"C:\\Users\\kabil\\WebstormProjects\\ratemyemployer\\src\\app\\companies\\new\\page.tsx"]}]},{}]},{}]},{layout:[()=>Promise.resolve().then(t.bind(t,71354)),"C:\\Users\\kabil\\WebstormProjects\\ratemyemployer\\src\\app\\layout.tsx"],"not-found":[()=>Promise.resolve().then(t.t.bind(t,19937,23)),"next/dist/client/components/not-found-error"],forbidden:[()=>Promise.resolve().then(t.t.bind(t,69116,23)),"next/dist/client/components/forbidden-error"],unauthorized:[()=>Promise.resolve().then(t.t.bind(t,41485,23)),"next/dist/client/components/unauthorized-error"]}],c=["C:\\Users\\kabil\\WebstormProjects\\ratemyemployer\\src\\app\\companies\\new\\page.tsx"],u={require:t,loadChunk:()=>Promise.resolve()},p=new s.AppPageRouteModule({definition:{kind:a.RouteKind.APP_PAGE,page:"/companies/new/page",pathname:"/companies/new",bundlePath:"",filename:"",appPaths:[]},userland:{loaderTree:d}})},14897:(e,r,t)=>{Promise.resolve().then(t.bind(t,25220))},5169:(e,r,t)=>{Promise.resolve().then(t.bind(t,17528))},17528:(e,r,t)=>{"use strict";t.r(r),t.d(r,{default:()=>d});var s=t(45512),a=t(58009),n=t(79334),o=t(86353),l=t(87876);function i(e){return e?e.startsWith("http://")||e.startsWith("https://")?e:`https://${e}`:""}function d(){let e=(0,n.useRouter)(),r=(0,n.useSearchParams)().get("name")||"",[t,d]=(0,a.useState)({name:r,industry:"",description:"",location:"",website:"",ceo:""}),[c,u]=(0,a.useState)(!1),[p,m]=(0,a.useState)(null),[x,h]=(0,a.useState)(null),b=async r=>{if(r.preventDefault(),!x){u(!0),m(null);try{let r=t.website?i(t.website):"",{data:s,error:a}=await o.N.from("companies").insert([{name:t.name,industry:t.industry,website:r,ceo:t.ceo,average_rating:0,total_reviews:0}]).select().single();if(a)throw console.error("Supabase error:",a),Error(a.message||"Failed to add company");if(!s)throw Error("No data returned from Supabase");e.push(`/companies/${s.id}`)}catch(e){console.error("Full error object:",e),m(e instanceof Error?e.message:"Failed to add company. Please try again."),u(!1)}}};return(0,s.jsxs)("div",{className:"max-w-xl mx-auto px-4 py-6",children:[(0,s.jsx)("h1",{className:"text-2xl font-bold mb-4",children:"Add a New Company"}),(0,s.jsxs)("form",{onSubmit:b,className:"space-y-4",children:[(0,s.jsxs)("div",{children:[(0,s.jsxs)("label",{className:"block text-sm font-medium mb-1",children:["Company Name ",(0,s.jsx)("span",{className:"text-red-500",children:"*"})]}),(0,s.jsx)("input",{type:"text",value:t.name,onChange:e=>d({...t,name:e.target.value}),required:!0,className:"w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700",placeholder:"Enter company name"})]}),(0,s.jsxs)("div",{children:[(0,s.jsxs)("label",{className:"block text-sm font-medium mb-1",children:["Industry ",(0,s.jsx)("span",{className:"text-red-500",children:"*"})]}),(0,s.jsxs)("select",{value:t.industry,onChange:e=>d({...t,industry:e.target.value}),required:!0,className:"w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700",children:[(0,s.jsx)("option",{value:"",children:"Select Industry"}),(0,s.jsx)("option",{value:"Technology",children:"Technology"}),(0,s.jsx)("option",{value:"Finance",children:"Finance"}),(0,s.jsx)("option",{value:"Healthcare",children:"Healthcare"}),(0,s.jsx)("option",{value:"Retail",children:"Retail"}),(0,s.jsx)("option",{value:"Manufacturing",children:"Manufacturing"}),(0,s.jsx)("option",{value:"Education",children:"Education"}),(0,s.jsx)("option",{value:"Entertainment",children:"Entertainment"}),(0,s.jsx)("option",{value:"Hospitality",children:"Hospitality"}),(0,s.jsx)("option",{value:"Construction",children:"Construction"}),(0,s.jsx)("option",{value:"Other",children:"Other"})]})]}),(0,s.jsxs)("div",{children:[(0,s.jsx)("label",{className:"block text-sm font-medium mb-1",children:"Description"}),(0,s.jsx)("textarea",{value:t.description,onChange:e=>d({...t,description:e.target.value}),className:"w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700",rows:3,placeholder:"Brief description of the company"})]}),(0,s.jsxs)("div",{children:[(0,s.jsxs)("label",{className:"block text-sm font-medium mb-1",children:["Location ",(0,s.jsx)("span",{className:"text-red-500",children:"*"})]}),(0,s.jsx)(l.q,{value:t.location,onChange:e=>d({...t,location:e}),required:!0,className:"w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700",placeholder:"Company headquarters location"})]}),(0,s.jsxs)("div",{children:[(0,s.jsx)("label",{className:"block text-sm font-medium mb-1",children:"Website"}),(0,s.jsx)("input",{type:"text",value:t.website,onChange:e=>{let r=e.target.value;d({...t,website:r}),r&&!function(e){if(!e)return!0;try{return new URL(i(e)),!0}catch{return!1}}(r)?h("Please enter a valid website URL"):h(null)},className:`w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 ${x?"border-red-500":""}`,placeholder:"Google.com or https://Google.com"}),x&&(0,s.jsx)("p",{className:"mt-0.5 text-xs text-red-500",children:x}),t.website&&!x&&(0,s.jsxs)("p",{className:"mt-0.5 text-xs text-gray-500",children:["Will be saved as: ",i(t.website)]})]}),(0,s.jsxs)("div",{children:[(0,s.jsx)("label",{className:"block text-sm font-medium mb-1",children:"CEO"}),(0,s.jsx)("input",{type:"text",value:t.ceo,onChange:e=>d({...t,ceo:e.target.value}),className:"w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700",placeholder:"Current CEO name"})]}),p&&(0,s.jsx)("div",{className:"bg-red-50 dark:bg-red-900 border-l-4 border-red-500 p-2 rounded text-sm",children:(0,s.jsxs)("div",{className:"flex",children:[(0,s.jsx)("div",{className:"flex-shrink-0",children:(0,s.jsx)("svg",{className:"h-4 w-4 text-red-500",viewBox:"0 0 20 20",fill:"currentColor",children:(0,s.jsx)("path",{fillRule:"evenodd",d:"M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z",clipRule:"evenodd"})})}),(0,s.jsx)("div",{className:"ml-2",children:(0,s.jsx)("p",{className:"text-red-700 dark:text-red-200",children:p})})]})}),(0,s.jsxs)("div",{className:"text-xs text-gray-500",children:[(0,s.jsx)("span",{className:"text-red-500",children:"*"})," Required fields"]}),(0,s.jsx)("button",{type:"submit",disabled:c||!!x,className:"w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors text-sm font-medium",children:c?"Adding Company...":"Add Company"})]})]})}},87876:(e,r,t)=>{"use strict";t.d(r,{q:()=>n});var s=t(45512),a=t(58009);function n({value:e,onChange:r,error:t}){let n=(0,a.useRef)(null),[o,l]=(0,a.useState)(!1);return(0,s.jsxs)("div",{children:[(0,s.jsx)("input",{ref:n,type:"text",value:e,onChange:e=>r(e.target.value),className:"mt-1",placeholder:"Enter location"}),t&&(0,s.jsx)("p",{className:"mt-1 text-sm text-red-600",children:t})]})}},25220:(e,r,t)=>{"use strict";t.r(r),t.d(r,{default:()=>s});let s=(0,t(46760).registerClientReference)(function(){throw Error("Attempted to call the default export of \"C:\\\\Users\\\\kabil\\\\WebstormProjects\\\\ratemyemployer\\\\src\\\\app\\\\companies\\\\new\\\\page.tsx\" from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"C:\\Users\\kabil\\WebstormProjects\\ratemyemployer\\src\\app\\companies\\new\\page.tsx","default")}};var r=require("../../../webpack-runtime.js");r.C(e);var t=e=>r(r.s=e),s=r.X(0,[638,626,317],()=>t(56003));module.exports=s})();