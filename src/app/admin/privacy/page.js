"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

export default function PrivacyReviewPage() {
  const {user}=useAuth();
  const [data,setData]=useState(null);
  const [error,setError]=useState(false);
  const [busy,setBusy]=useState(false);
  const call=useCallback(async(body)=>{
    const {data:session}=await supabase.auth.getSession();
    const response=await fetch('/api/admin/member-privacy',{method:body?'POST':'GET',headers:{Authorization:`Bearer ${session?.session?.access_token||''}`,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});
    if(!response.ok)throw Error('unavailable');return {...await response.json(),viewer:session?.session?.user?.id};
  },[]);
  const load=useCallback(async()=>{setError(false);try{setData(await call());}catch{setData(null);setError(true);}},[call]);
  useEffect(()=>{
    let active=true;
    queueMicrotask(()=>{if(active)void load();});
    const clear=()=>setData(null);
    const visible=()=>{clear();if(document.visibilityState==='visible')void load();};
    window.addEventListener('qa:privacy-changed',clear);document.addEventListener('visibilitychange',visible);
    return()=>{active=false;window.removeEventListener('qa:privacy-changed',clear);document.removeEventListener('visibilitychange',visible);};
  },[load]);
  const update=async(id,status)=>{setBusy(true);try{await call({id,status});await load();}catch{setError(true);}finally{setBusy(false);}};
  const safeData=data?.viewer===user?.id?data:null;
  return <main className="min-h-screen bg-[#0B1220] p-4 pb-28 text-[#F5F1E8] sm:p-8"><div className="mx-auto max-w-5xl"><p className="text-xs uppercase tracking-wider text-[#B9AAF0]">Restricted operations</p><h1 className="mt-2 text-3xl font-semibold">Privacy & safety review</h1><p className="mt-3 text-sm leading-6 text-[#BCC7D2]">Authorized administrators only. Reports may contain sensitive information. Do not copy them into analytics, email or external tools.</p>
    {error&&<p role="alert" className="mt-4 text-[#F2B38B]">Access denied or privacy service unavailable.</p>}
    <button className="my-4 min-h-11 rounded-xl bg-[#80D4C4] px-4 text-sm font-semibold text-[#0B1220]" onClick={load}>Refresh</button>
    {safeData?.reports.map(report=><article key={report.id} className="mb-3 rounded-2xl border border-[#2B3949] bg-[#141E2C] p-4"><h2 className="font-semibold">{report.reason}</h2><p className="mt-2 text-xs text-[#BCC7D2]">{new Date(report.created_at).toLocaleString()} · {report.id}</p><p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6">{report.details}</p><label className="mt-3 block text-sm">Review status<select value={report.status} disabled={busy} onChange={e=>update(report.id,e.target.value)} className="ml-3 min-h-11 rounded-xl border border-[#3B5060] bg-[#0B1220] p-2">{['new','reviewing','closed'].map(status=><option key={status}>{status}</option>)}</select></label></article>)}
    {safeData&&<section className="mt-6 rounded-2xl border border-[#2B3949] bg-[#141E2C] p-4"><h2 className="text-lg font-semibold">Pending account deletions</h2><p className="mt-2 text-sm text-[#BCC7D2]">These accounts are hidden. Investigate storage or foreign-key failures; never republish them.</p>{safeData.deletions.map(row=><p key={row.user_id} className="mt-3 break-all text-xs text-[#BCC7D2]">{row.user_id} · {row.deletion_requested_at}</p>)}</section>}
  </div></main>;
}
