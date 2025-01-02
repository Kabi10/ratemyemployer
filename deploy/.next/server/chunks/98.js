"use strict";exports.id=98,exports.ids=[98],exports.modules={52098:(e,a,s)=>{s.r(a),s.d(a,{default:()=>p});var r=s(45512),t=s(58009),d=s(28531),l=s.n(d),i=s(64590);function n({company:e}){return(0,r.jsx)(l(),{href:`/companies/${e.id}`,children:(0,r.jsxs)(i.Zp,{className:"p-4 hover:shadow-lg transition-shadow",children:[(0,r.jsxs)("div",{className:"flex items-start justify-between",children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("h3",{className:"text-lg font-semibold",children:e.name}),(0,r.jsx)("p",{className:"text-sm text-gray-600",children:e.industry}),(0,r.jsx)("p",{className:"text-sm text-gray-500",children:e.location})]}),(0,r.jsxs)("div",{className:"text-right",children:[(0,r.jsx)("div",{className:"text-lg font-bold",children:e.average_rating.toFixed(1)}),(0,r.jsxs)("div",{className:"text-sm text-gray-600",children:[e.total_reviews," reviews"]})]})]}),e.description&&(0,r.jsx)("p",{className:"mt-2 text-sm text-gray-600 line-clamp-2",children:e.description})]})})}var c=s(57427),o=s(86353);let m=async(e,{limit:a=10,offset:s=0,searchQuery:r="",industry:t=""})=>{let d=o.N.from("companies").select("*",{count:"exact"});r&&(d=d.ilike("name",`%${r}%`)),t&&(d=d.eq("industry",t));let{data:l,error:i,count:n}=await d.range(s,s+a-1).order("name");if(i)throw i;return{companies:l||[],count:n||0}},x=t.forwardRef(function({title:e,titleId:a,...s},r){return t.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:r,"aria-labelledby":a},s),e?t.createElement("title",{id:a},e):null,t.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M15.75 19.5 8.25 12l7.5-7.5"}))}),g=t.forwardRef(function({title:e,titleId:a,...s},r){return t.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:r,"aria-labelledby":a},s),e?t.createElement("title",{id:a},e):null,t.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"m8.25 4.5 7.5 7.5-7.5 7.5"}))});function p(){let[e,a]=(0,t.useState)(1),{companies:s,totalCount:d,isLoading:l,error:i}=function(e={}){let{data:a,error:s,isLoading:r,mutate:t}=(0,c.Ay)(["companies",e],([e,a])=>m("companies",a),{revalidateOnFocus:!1,revalidateOnReconnect:!1});return{companies:a?.companies||[],totalCount:a?.count||0,isLoading:r,error:s,mutate:t}}({limit:9,offset:(e-1)*9}),o=Math.ceil(d/9);return l?(0,r.jsx)("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",children:[...Array(9)].map((e,a)=>(0,r.jsxs)("div",{className:"animate-pulse",children:[(0,r.jsx)("div",{className:"bg-gray-200 dark:bg-gray-700 h-48 rounded-lg mb-4"}),(0,r.jsx)("div",{className:"h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"}),(0,r.jsx)("div",{className:"h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"})]},a))}):i?(0,r.jsx)("div",{className:"text-center py-8",children:(0,r.jsx)("p",{className:"text-red-500",children:i.message})}):0===s.length?(0,r.jsx)("div",{className:"text-center py-8",children:(0,r.jsx)("p",{className:"text-gray-500",children:"No companies found."})}):(0,r.jsxs)("div",{className:"space-y-8",children:[(0,r.jsx)("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",children:s.map(e=>(0,r.jsx)(n,{company:e},e.id))}),o>1&&(0,r.jsxs)("div",{className:"flex justify-center items-center space-x-4",children:[(0,r.jsx)("button",{onClick:()=>a(e=>Math.max(1,e-1)),disabled:1===e,className:"p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed",children:(0,r.jsx)(x,{className:"w-5 h-5"})}),(0,r.jsxs)("span",{className:"text-sm",children:["Page ",e," of ",o]}),(0,r.jsx)("button",{onClick:()=>a(e=>Math.min(o,e+1)),disabled:e===o,className:"p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed",children:(0,r.jsx)(g,{className:"w-5 h-5"})})]})]})}},64590:(e,a,s)=>{s.d(a,{Wu:()=>c,ZB:()=>n,Zp:()=>l,aR:()=>i});var r=s(45512),t=s(58009),d=s(44195);let l=t.forwardRef(({className:e,...a},s)=>(0,r.jsx)("div",{ref:s,className:(0,d.cn)("rounded-lg border bg-card text-card-foreground shadow-sm",e),...a}));l.displayName="Card";let i=t.forwardRef(({className:e,...a},s)=>(0,r.jsx)("div",{ref:s,className:(0,d.cn)("flex flex-col space-y-1.5 p-6",e),...a}));i.displayName="CardHeader";let n=t.forwardRef(({className:e,...a},s)=>(0,r.jsx)("h3",{ref:s,className:(0,d.cn)("text-2xl font-semibold leading-none tracking-tight",e),...a}));n.displayName="CardTitle",t.forwardRef(({className:e,...a},s)=>(0,r.jsx)("p",{ref:s,className:(0,d.cn)("text-sm text-muted-foreground",e),...a})).displayName="CardDescription";let c=t.forwardRef(({className:e,...a},s)=>(0,r.jsx)("div",{ref:s,className:(0,d.cn)("p-6 pt-0",e),...a}));c.displayName="CardContent",t.forwardRef(({className:e,...a},s)=>(0,r.jsx)("div",{ref:s,className:(0,d.cn)("flex items-center p-6 pt-0",e),...a})).displayName="CardFooter"}};