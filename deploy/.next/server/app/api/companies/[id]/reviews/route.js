(()=>{var e={};e.id=389,e.ids=[389],e.modules={10846:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},44870:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},3295:e=>{"use strict";e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},29294:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},63033:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},79428:e=>{"use strict";e.exports=require("buffer")},55511:e=>{"use strict";e.exports=require("crypto")},94735:e=>{"use strict";e.exports=require("events")},81630:e=>{"use strict";e.exports=require("http")},55591:e=>{"use strict";e.exports=require("https")},91645:e=>{"use strict";e.exports=require("net")},11997:e=>{"use strict";e.exports=require("punycode")},27910:e=>{"use strict";e.exports=require("stream")},34631:e=>{"use strict";e.exports=require("tls")},79551:e=>{"use strict";e.exports=require("url")},74075:e=>{"use strict";e.exports=require("zlib")},38775:(e,r,t)=>{"use strict";t.r(r),t.d(r,{patchFetch:()=>q,routeModule:()=>x,serverHooks:()=>w,workAsyncStorage:()=>m,workUnitAsyncStorage:()=>v});var s={};t.r(s),t.d(s,{GET:()=>d,POST:()=>l,dynamic:()=>p});var i=t(42706),o=t(28203),n=t(45994),a=t(33406),u=t(44512),c=t(39187);let p="force-dynamic";async function d(e,{params:r}){let t=(0,a.createRouteHandlerClient)({cookies:u.UL});try{let{data:e,error:s}=await t.from("reviews").select("*").eq("company_id",r.id).order("created_at",{ascending:!1});if(s)throw s;return c.NextResponse.json(e)}catch(e){return console.error("Error fetching reviews:",e),c.NextResponse.json({error:"Failed to fetch reviews"},{status:500})}}async function l(e,{params:r}){let t=(0,a.createRouteHandlerClient)({cookies:u.UL}),s=await e.json();try{let{data:e,error:i}=await t.from("reviews").insert([{...s,company_id:r.id}]).select().single();if(i)throw i;return c.NextResponse.json(e)}catch(e){return console.error("Error creating review:",e),c.NextResponse.json({error:"Failed to create review"},{status:500})}}let x=new i.AppRouteRouteModule({definition:{kind:o.RouteKind.APP_ROUTE,page:"/api/companies/[id]/reviews/route",pathname:"/api/companies/[id]/reviews",filename:"route",bundlePath:"app/api/companies/[id]/reviews/route"},resolvedPagePath:"C:\\Users\\kabil\\WebstormProjects\\ratemyemployer\\src\\app\\api\\companies\\[id]\\reviews\\route.ts",nextConfigOutput:"standalone",userland:s}),{workAsyncStorage:m,workUnitAsyncStorage:v,serverHooks:w}=x;function q(){return(0,n.patchFetch)({workAsyncStorage:m,workUnitAsyncStorage:v})}},96487:()=>{},78335:()=>{}};var r=require("../../../../../webpack-runtime.js");r.C(e);var t=e=>r(r.s=e),s=r.X(0,[638,993,833],()=>t(38775));module.exports=s})();