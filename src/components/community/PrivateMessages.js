"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { memberPrivacyCopy } from "@/lib/memberPrivacyCopy";
import { PRIVACY_CHANGED, privacyCall, privacyChanged } from "@/lib/memberPrivacy";
import PrivateEventRequests from "@/components/community/PrivateEventRequests";
import { resolveAdminAccess } from "@/lib/adminAccess";
import { supabase } from "@/lib/supabase";

const button="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#80D4C4] px-4 py-2 text-sm font-semibold text-[#0B1220] disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#80D4C4]";
export default function PrivateMessages() {
  const {user}=useAuth();
  return <PrivateMessagesContent key={user?.id || "guest"} />;
}
function PrivateMessagesContent() {
  const params=useSearchParams();
  const {user,isLoading:isAuthLoading}=useAuth();
  const userId=user?.id||'';
  const userEmail=user?.email||'';
  const { locale, t }=useLocale();
  const copy=memberPrivacyCopy(locale);
  const [target,setTarget]=useState(params.get('user')||'');
  const [state,setState]=useState(null);
  const [threads,setThreads]=useState([]);
  const [peers,setPeers]=useState([]);
  const [isAdmin,setIsAdmin]=useState(false);
  const [messages,setMessages]=useState([]);
  const [body,setBody]=useState('');
  const [busy,setBusy]=useState(false);
  const [failed,setFailed]=useState(false);
  const [view,setView]=useState('messages');
  const [recipientQuery,setRecipientQuery]=useState('');
  const generation=useRef(0);
  const refresh=useCallback(async()=>{
    const n=++generation.current;
    if(!userId){setState(null);setThreads([]);setPeers([]);setMessages([]);setIsAdmin(false);return;}
    try{
      const own=await privacyCall('state');
      if(n!==generation.current)return;
      setState(own);
      const access=await resolveAdminAccess({email:userEmail});
      setIsAdmin(Boolean(access?.isAdmin));
      if(!own?.eligible&&!access?.isAdmin){setThreads([]);setPeers([]);setMessages([]);return;}
      const [list, peerList]=await Promise.all([privacyCall('threads'),privacyCall('message_peers')]);
      const rows=target?await privacyCall('messages',{target}):[];
      if(n!==generation.current)return;
      const threadRows=Array.isArray(list)?list:[];
      setThreads(threadRows);setPeers(Array.isArray(peerList)?peerList:[]);setMessages(Array.isArray(rows)?rows.slice().reverse():[]);setFailed(false);
      const currentThread=threadRows.find(row=>row.user_id===target);
      if(currentThread?.id)void supabase.rpc('qa_mark_thread_read',{target_thread_id:currentThread.id});
    }catch{if(n===generation.current){setMessages([]);setThreads([]);setPeers([]);setFailed(true);}}
  },[target,userEmail,userId]);
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
  const acceptedFriends=(state?.contacts||[]).filter(c=>c.state==='accepted').map(c=>({user_id:c.user_id,alias:c.alias,is_admin:false}));
  const people=[...acceptedFriends,...peers,...threads].filter((r,i,a)=>r?.user_id&&a.findIndex(x=>x.user_id===r.user_id)===i);
  const adminPeer=people.find(person=>person.is_admin);
  const conversationIds=new Set(threads.map(thread=>thread.user_id));
  const startableFriends=(isAdmin?people.filter(person=>!person.is_admin):acceptedFriends.filter(person=>!conversationIds.has(person.user_id))).filter(person=>!recipientQuery.trim()||person.alias?.toLowerCase().includes(recipientQuery.trim().toLowerCase()));
  const contact=people.find(c=>c.user_id===target);
  const permitted=Boolean(user?.id && (state?.profile?.user_id===user.id||isAdmin));
  const signedOut=Boolean(!user?.id&&!isAuthLoading);
  return <main className="min-h-screen bg-[#0B1220] px-4 py-8 pb-28 text-[#F5F1E8] sm:px-6"><div className="mx-auto max-w-5xl space-y-4">
    <header><p className="text-xs font-semibold uppercase tracking-wider text-[#B9AAF0]">{copy.requests}</p><h1 className="mt-2 text-3xl font-semibold">{t("messages.privateTitle", "Private messages")}</h1><p className="mt-3 text-sm leading-6 text-[#BCC7D2]">{t("messages.privateIntro", "Approved contacts can exchange private messages. Every active member can also message Queer Atlas Admin without a contact request. No online status or read receipts.")}</p><Link href="/privacy-settings" className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-[#80D4C4]">{copy.settings} ↗</Link></header>
    {signedOut?<div role="status" className="rounded-2xl bg-[#141E2C] p-5 text-sm leading-6 text-[#BCC7D2]">Sign in to view messages or contact Queer Atlas Admin.<Link href="/?join=true" className="ml-2 font-semibold text-[#80D4C4] underline underline-offset-2">Sign in</Link></div>:!permitted?<p role="status" className="rounded-2xl bg-[#141E2C] p-5 text-sm leading-6 text-[#BCC7D2]">{failed?copy.unavailable:state?copy.staged:copy.loading}</p>:<div className="grid gap-4 lg:grid-cols-[18rem_1fr]">
      <nav aria-label={copy.requests} className="rounded-[22px] border border-[#2B3949] bg-[#141E2C] p-3"><div className="flex gap-2 border-b border-[#2B3949] pb-3"><button className={`min-h-10 flex-1 rounded-lg text-xs font-semibold ${view==='messages'?'bg-[#B9AAF0]/15 text-[#B9AAF0]':'text-[#BCC7D2]'}`} onClick={()=>setView('messages')}>Messages</button><button className={`min-h-10 flex-1 rounded-lg text-xs font-semibold ${view==='requests'?'bg-[#B9AAF0]/15 text-[#B9AAF0]':'text-[#BCC7D2]'}`} onClick={()=>setView('requests')}>Requests</button></div>{view==='messages'&&<><p className="mt-4 px-2 text-[10px] font-semibold uppercase tracking-wider text-[#80D4C4]">Start a new message</p>{adminPeer&&<button className={`mt-2 min-h-11 rounded-xl px-3 py-2 text-left text-sm font-semibold lg:block lg:w-full ${target===adminPeer.user_id?'bg-[#80D4C4]/12 text-[#80D4C4]':'text-[#F5F1E8]'}`} onClick={()=>{generation.current++;setMessages([]);setTarget(adminPeer.user_id);}}>Queer Atlas Admin</button>}{isAdmin&&<label className="mt-3 block px-1 text-xs text-[#BCC7D2]">Search members<input value={recipientQuery} onChange={event=>setRecipientQuery(event.target.value)} placeholder="Search alias…" className="mt-1 min-h-11 w-full rounded-xl border border-[#3B5060] bg-[#0B1220] px-3 text-sm text-[#F5F1E8]" /></label>}<p className="mt-5 px-2 text-[10px] font-semibold uppercase tracking-wider text-[#B9AAF0]">Conversations</p><div className="mt-2 flex flex-wrap gap-2 lg:block">{threads.filter(c=>!c.is_admin).map(c=><button key={c.user_id} className={`min-h-11 rounded-xl px-3 py-2 text-left text-sm lg:block lg:w-full ${target===c.user_id?'bg-[#B9AAF0]/15 text-[#B9AAF0]':'text-[#BCC7D2]'}`} onClick={()=>{generation.current++;setMessages([]);setTarget(c.user_id);}}>{c.alias}</button>)}</div><p className="mt-5 px-2 text-[10px] font-semibold uppercase tracking-wider text-[#B9AAF0]">{isAdmin?'Members':'Friends'}</p><div className="mt-2 flex flex-wrap gap-2 lg:block">{startableFriends.map(c=><button key={c.user_id} className={`min-h-11 rounded-xl px-3 py-2 text-left text-sm lg:block lg:w-full ${target===c.user_id?'bg-[#B9AAF0]/15 text-[#B9AAF0]':'text-[#BCC7D2]'}`} onClick={()=>{generation.current++;setMessages([]);setTarget(c.user_id);}}>{c.alias}</button>)}{!startableFriends.length&&<p className="px-2 py-2 text-xs text-[#BCC7D2]">{isAdmin?'No members match this search.':'Add friends in People to start a message.'}</p>}</div></>}</nav>
      {view==='requests'?<PrivateEventRequests/>:<section className="rounded-[22px] border border-[#2B3949] bg-[#141E2C] p-4 sm:p-5" aria-label={copy.message}>
        {target&&contact?<><header className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-semibold">{contact.is_admin?'Admin':contact.alias}</h2><div className="flex gap-3">{!contact.is_admin&&<Link href={`/favorites?member=${encodeURIComponent(target)}`} className="inline-flex min-h-11 items-center text-sm text-[#B9AAF0]">{copy.report}</Link>}<button disabled={busy} onClick={block} className="min-h-11 text-sm text-[#FDA4AF]">{copy.block}</button></div></header>
          <ol className="my-4 max-h-[45vh] space-y-3 overflow-y-auto" aria-live="polite">{messages.map(m=><li key={m.id} className={`max-w-[90%] whitespace-pre-wrap break-words rounded-xl px-3 py-2 text-sm leading-6 ${m.sender_id===user?.id?'ml-auto bg-[#80D4C4]/10 text-[#F5F1E8]':'bg-[#B9AAF0]/10 text-[#F5F1E8]'}`}>{m.body}</li>)}</ol>
          <form onSubmit={send}><label className="block text-sm text-[#BCC7D2]">{copy.message}<textarea value={body} onChange={e=>setBody(e.target.value)} maxLength={2000} rows={3} className="mt-2 w-full rounded-xl border border-[#3B5060] bg-[#0B1220] p-3 text-base text-[#F5F1E8] focus-visible:outline-2 focus-visible:outline-[#80D4C4]" /></label><button disabled={busy||!body.trim()} className={`${button} mt-3`}>{t("messages.send", "Send")}</button></form>
        </>:<div className="py-12 text-center"><h2 className="text-lg font-semibold">Start a private conversation</h2><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#BCC7D2]">Choose a friend or Queer Atlas Admin from the list to start a private conversation.</p><div className="mt-5 flex justify-center gap-3">{adminPeer&&<button className={button} onClick={()=>setTarget(adminPeer.user_id)}>Message Admin</button>}<Link href="/community" className="inline-flex min-h-11 items-center rounded-xl border border-[#3B5060] px-4 py-2 text-sm font-semibold text-[#B9AAF0]">Find friends in People</Link></div></div>}
      </section>}
    </div>}
    {failed&&<p role="alert" className="text-sm text-[#F2B38B]">{copy.unavailable}</p>}
  </div></main>;
}
