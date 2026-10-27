"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { memberPrivacyCopy } from "@/lib/memberPrivacyCopy";
import { PRIVACY_CHANGED, privacyCall, privacyChanged } from "@/lib/memberPrivacy";
import PrivateEventRequests from "@/components/community/PrivateEventRequests";

const button="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#80D4C4] px-4 py-2 text-sm font-semibold text-[#0B1220] disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#80D4C4]";
export default function PrivateMessages() {
  const {user}=useAuth();
  return <PrivateMessagesContent key={user?.id || "guest"} />;
}
function PrivateMessagesContent() {
  const params=useSearchParams();
  const {user}=useAuth();
  const { locale, t }=useLocale();
  const copy=memberPrivacyCopy(locale);
  const [target,setTarget]=useState(params.get('user')||'');
  const [state,setState]=useState(null);
  const [threads,setThreads]=useState([]);
  const [messages,setMessages]=useState([]);
  const [body,setBody]=useState('');
  const [busy,setBusy]=useState(false);
  const [failed,setFailed]=useState(false);
  const generation=useRef(0);
  const refresh=useCallback(async()=>{
    const n=++generation.current;
    if(!user?.id){setState(null);setThreads([]);setMessages([]);return;}
    try{
      const own=await privacyCall('state');
      if(n!==generation.current)return;
      setState(own);
      if(!own?.eligible){setThreads([]);setMessages([]);return;}
      const list=await privacyCall('threads');
      const rows=target?await privacyCall('messages',{target}):[];
      if(n!==generation.current)return;
      setThreads(Array.isArray(list)?list:[]);setMessages(Array.isArray(rows)?rows.slice().reverse():[]);setFailed(false);
    }catch{if(n===generation.current){setMessages([]);setThreads([]);setFailed(true);}}
  },[target,user?.id]);
  useEffect(()=>{
    let active=true;
    queueMicrotask(()=>{if(active)void refresh();});
    const clear=()=>{generation.current++;setMessages([]);setThreads([]);};
    const run=()=>{if(document.visibilityState==='visible')void refresh();else clear();};
    const timer=setInterval(run,10_000);
    document.addEventListener('visibilitychange',run);window.addEventListener('offline',clear);window.addEventListener(PRIVACY_CHANGED,run);
    return()=>{active=false;clear();clearInterval(timer);document.removeEventListener('visibilitychange',run);window.removeEventListener('offline',clear);window.removeEventListener(PRIVACY_CHANGED,run);};
  },[refresh]);
  const send=async(e)=>{
    e.preventDefault();if(!body.trim()||!target||busy)return;
    setBusy(true);try{await privacyCall('send',{target,message_body:body});setBody('');await refresh();}catch{setFailed(true);setMessages([]);}finally{setBusy(false);}
  };
  const block=async()=>{setBusy(true);try{await privacyCall('block',{target,blocked:true});setMessages([]);setTarget('');privacyChanged();await refresh();}catch{setFailed(true);}finally{setBusy(false);}};
  const contact=(state?.contacts||[]).find(c=>c.user_id===target&&c.state==='accepted');
  const permitted=Boolean(user?.id && state?.profile?.user_id===user.id && state.eligible);
  return <main className="min-h-screen bg-[#0B1220] px-4 py-8 pb-28 text-[#F5F1E8] sm:px-6"><div className="mx-auto max-w-5xl space-y-4">
    <header><p className="text-xs font-semibold uppercase tracking-wider text-[#B9AAF0]">{copy.requests}</p><h1 className="mt-2 text-3xl font-semibold">{t("messages.privateTitle", "Private messages")}</h1><p className="mt-3 text-sm leading-6 text-[#BCC7D2]">{t("messages.privateIntro", "Only approved contacts can send you messages. No online status or read receipts.")}</p><Link href="/privacy-settings" className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-[#80D4C4]">{copy.settings} ↗</Link></header>
    {!permitted?<p role="status" className="rounded-2xl bg-[#141E2C] p-5 text-sm leading-6 text-[#BCC7D2]">{failed?copy.unavailable:state?copy.staged:copy.loading}</p>:<div className="grid gap-4 lg:grid-cols-[16rem_1fr]">
      <nav aria-label={copy.requests} className="rounded-[22px] border border-[#2B3949] bg-[#141E2C] p-3"><div className="flex flex-wrap gap-2 lg:block">{[...(state.contacts||[]).filter(c=>c.state==='accepted').map(c=>({user_id:c.user_id,alias:c.alias})),...threads].filter((r,i,a)=>a.findIndex(x=>x.user_id===r.user_id)===i).map(c=><button key={c.user_id} className={`min-h-11 rounded-xl px-3 py-2 text-left text-sm lg:block lg:w-full ${target===c.user_id?'bg-[#B9AAF0]/15 text-[#B9AAF0]':'text-[#BCC7D2]'}`} onClick={()=>{generation.current++;setMessages([]);setTarget(c.user_id);}}>{c.alias}</button>)}</div></nav>
      <section className="rounded-[22px] border border-[#2B3949] bg-[#141E2C] p-4 sm:p-5" aria-label={copy.message}>
        {target&&contact?<><header className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-semibold">{contact.alias}</h2><div className="flex gap-3"><Link href={`/favorites?member=${encodeURIComponent(target)}`} className="inline-flex min-h-11 items-center text-sm text-[#B9AAF0]">{copy.report}</Link><button disabled={busy} onClick={block} className="min-h-11 text-sm text-[#FDA4AF]">{copy.block}</button></div></header>
          <ol className="my-4 max-h-[45vh] space-y-3 overflow-y-auto" aria-live="polite">{messages.map(m=><li key={m.id} className={`max-w-[90%] whitespace-pre-wrap break-words rounded-xl px-3 py-2 text-sm leading-6 ${m.sender_id===user?.id?'ml-auto bg-[#80D4C4]/10 text-[#F5F1E8]':'bg-[#B9AAF0]/10 text-[#F5F1E8]'}`}>{m.body}</li>)}</ol>
          <form onSubmit={send}><label className="block text-sm text-[#BCC7D2]">{copy.message}<textarea value={body} onChange={e=>setBody(e.target.value)} maxLength={2000} rows={3} className="mt-2 w-full rounded-xl border border-[#3B5060] bg-[#0B1220] p-3 text-base text-[#F5F1E8] focus-visible:outline-2 focus-visible:outline-[#80D4C4]" /></label><button disabled={busy||!body.trim()} className={`${button} mt-3`}>{t("messages.send", "Send")}</button></form>
        </>:<p className="text-sm leading-6 text-[#BCC7D2]">{copy.empty}</p>}
      </section>
    </div>}
    {permitted && <PrivateEventRequests />}
    {failed&&<p role="alert" className="text-sm text-[#F2B38B]">{copy.unavailable}</p>}
  </div></main>;
}
