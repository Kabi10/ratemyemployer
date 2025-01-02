(()=>{var e={};e.id=722,e.ids=[722],e.modules={10846:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},19121:e=>{"use strict";e.exports=require("next/dist/server/app-render/action-async-storage.external.js")},3295:e=>{"use strict";e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},29294:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},63033:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},79428:e=>{"use strict";e.exports=require("buffer")},55511:e=>{"use strict";e.exports=require("crypto")},94735:e=>{"use strict";e.exports=require("events")},81630:e=>{"use strict";e.exports=require("http")},55591:e=>{"use strict";e.exports=require("https")},91645:e=>{"use strict";e.exports=require("net")},33873:e=>{"use strict";e.exports=require("path")},11997:e=>{"use strict";e.exports=require("punycode")},27910:e=>{"use strict";e.exports=require("stream")},34631:e=>{"use strict";e.exports=require("tls")},79551:e=>{"use strict";e.exports=require("url")},74075:e=>{"use strict";e.exports=require("zlib")},16781:(e,r,t)=>{"use strict";t.r(r),t.d(r,{GlobalError:()=>n.a,__next_app__:()=>p,pages:()=>l,routeModule:()=>u,tree:()=>c});var s=t(70260),i=t(28203),o=t(25155),n=t.n(o),a=t(67292),d={};for(let e in a)0>["default","tree","pages","GlobalError","__next_app__","routeModule"].indexOf(e)&&(d[e]=()=>a[e]);t.d(r,d);let c=["",{children:["admin",{children:["companies",{children:["__PAGE__",{},{page:[()=>Promise.resolve().then(t.bind(t,8493)),"C:\\Users\\kabil\\WebstormProjects\\ratemyemployer\\src\\app\\admin\\companies\\page.tsx"]}]},{}]},{}]},{layout:[()=>Promise.resolve().then(t.bind(t,71354)),"C:\\Users\\kabil\\WebstormProjects\\ratemyemployer\\src\\app\\layout.tsx"],"not-found":[()=>Promise.resolve().then(t.t.bind(t,19937,23)),"next/dist/client/components/not-found-error"],forbidden:[()=>Promise.resolve().then(t.t.bind(t,69116,23)),"next/dist/client/components/forbidden-error"],unauthorized:[()=>Promise.resolve().then(t.t.bind(t,41485,23)),"next/dist/client/components/unauthorized-error"]}],l=["C:\\Users\\kabil\\WebstormProjects\\ratemyemployer\\src\\app\\admin\\companies\\page.tsx"],p={require:t,loadChunk:()=>Promise.resolve()},u=new s.AppPageRouteModule({definition:{kind:i.RouteKind.APP_PAGE,page:"/admin/companies/page",pathname:"/admin/companies",bundlePath:"",filename:"",appPaths:[]},userland:{loaderTree:c}})},10782:(e,r,t)=>{Promise.resolve().then(t.bind(t,8493))},2534:(e,r,t)=>{Promise.resolve().then(t.bind(t,8513))},8513:(e,r,t)=>{"use strict";t.r(r),t.d(r,{default:()=>c});var s=t(45512),i=t(58009),o=t(65210),n=t(86353),a=t(79334),d=t(37096);function c(){let{user:e}=(0,o.A)(),[r,t]=(0,i.useState)([]),[c,l]=(0,i.useState)(!0),p=(0,a.useRouter)(),{showToast:u}=(0,d.d)();async function m(){try{let{data:e,error:r}=await n.N.from("companies").select("*").order("created_at",{ascending:!1});if(r)throw r;t(e||[])}catch(e){console.error("Error fetching companies:",e),u("Failed to load companies","error")}finally{l(!1)}}async function x(e){try{let{error:r}=await n.N.from("companies").update({verified:!0,verification_date:new Date().toISOString()}).eq("id",e);if(r)throw r;u("Company verified successfully","success"),m()}catch(e){console.error("Error verifying company:",e),u("Failed to verify company","error")}}return c?(0,s.jsx)("div",{children:"Loading..."}):(0,s.jsxs)("div",{className:"container mx-auto px-4 py-8",children:[(0,s.jsx)("h1",{className:"text-2xl font-bold mb-6",children:"Manage Companies"}),(0,s.jsx)("div",{className:"space-y-4",children:r.map(e=>(0,s.jsxs)("div",{className:"bg-white shadow rounded-lg p-6",children:[(0,s.jsxs)("div",{className:"flex justify-between items-start",children:[(0,s.jsxs)("div",{children:[(0,s.jsx)("h2",{className:"text-xl font-semibold",children:e.name}),(0,s.jsx)("p",{className:"text-gray-600",children:e.industry}),(0,s.jsx)("p",{className:"text-sm text-gray-500",children:e.location})]}),(0,s.jsxs)("div",{className:"flex items-center space-x-4",children:[!e.verified&&(0,s.jsx)("button",{onClick:()=>x(e.id),className:"px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600",children:"Verify"}),(0,s.jsx)("button",{onClick:()=>p.push(`/companies/${e.id}/edit`),className:"px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600",children:"Edit"})]})]}),(0,s.jsxs)("div",{className:"mt-4 grid grid-cols-3 gap-4 text-sm",children:[(0,s.jsxs)("div",{children:[(0,s.jsx)("span",{className:"font-medium",children:"Reviews:"})," ",e.total_reviews]}),(0,s.jsxs)("div",{children:[(0,s.jsx)("span",{className:"font-medium",children:"Rating:"})," ",e.average_rating.toFixed(1)]}),(0,s.jsxs)("div",{children:[(0,s.jsx)("span",{className:"font-medium",children:"Created:"})," ",new Date(e.created_at).toLocaleDateString()]})]})]},e.id))})]})}},37096:(e,r,t)=>{"use strict";t.d(r,{d:()=>o}),t(45512);var s=t(58009);let i=(0,s.createContext)(void 0);function o(){let e=(0,s.useContext)(i);if(!e)throw Error("useToast must be used within a ToastProvider");return e}},8493:(e,r,t)=>{"use strict";t.r(r),t.d(r,{default:()=>s});let s=(0,t(46760).registerClientReference)(function(){throw Error("Attempted to call the default export of \"C:\\\\Users\\\\kabil\\\\WebstormProjects\\\\ratemyemployer\\\\src\\\\app\\\\admin\\\\companies\\\\page.tsx\" from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"C:\\Users\\kabil\\WebstormProjects\\ratemyemployer\\src\\app\\admin\\companies\\page.tsx","default")}};var r=require("../../../webpack-runtime.js");r.C(e);var t=e=>r(r.s=e),s=r.X(0,[638,626,317],()=>t(16781));module.exports=s})();