"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LockKeyhole, Shield, UserRound, ArrowUpRight } from "lucide-react";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { memberPrivacyCopy } from "@/lib/memberPrivacyCopy";
import { normalizeSharedProfile, sharedProfilePreview, validSharedAlias } from "@/lib/memberPrivacyModel";
import { PRIVACY_CHANGED, privacyCall, privacyChanged, privateAvatar } from "@/lib/memberPrivacy";

const panel = "rounded-[22px] border border-[#2B3949] bg-[#141E2C] p-4 sm:p-6";
const primary = "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#80D4C4] px-4 py-3 text-sm font-semibold text-[#0B1220] transition-colors hover:bg-[#A4E6D8] disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#80D4C4]";
const secondary = "inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#B9AAF0]/35 px-4 py-2 text-sm font-semibold text-[#B9AAF0] disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#80D4C4]";
const field = "mt-2 min-h-11 w-full rounded-xl border border-[#3B5060] bg-[#0B1220] px-3 py-2 text-base text-[#F5F1E8] outline-none focus-visible:ring-2 focus-visible:ring-[#80D4C4]";

function usePrivacyState(enabled = true) {
  const { user } = useAuth();
  const [state, setState] = useState(null);
  const [error, setError] = useState(false);
  const sequence = useRef(0);
  const refresh = useCallback(async () => {
    const request = ++sequence.current;
    if (!enabled || !user?.id) { setState(null); return; }
    try {
      const data = await privacyCall("state");
      if (request === sequence.current) { setState(data); setError(false); }
    } catch { if (request === sequence.current) { setState(null); setError(true); } }
  }, [user?.id, enabled]);
  useEffect(() => {
    const run = () => { if (document.visibilityState === "visible") void refresh(); };
    queueMicrotask(() => void refresh());
    const timer = setInterval(run, 15_000);
    window.addEventListener("focus", run);
    window.addEventListener(PRIVACY_CHANGED, run);
    const clear = () => { sequence.current++; setState(null); };
    window.addEventListener("offline", clear);
    return () => { clear(); clearInterval(timer); window.removeEventListener("focus", run); window.removeEventListener(PRIVACY_CHANGED, run); window.removeEventListener("offline", clear); };
  }, [refresh]);
  return { state: state?.profile?.user_id === user?.id ? state : null, error, refresh };
}

function Avatar({ path, label = "", revision }) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    let active = true;
    queueMicrotask(() => { if (active) setUrl(""); });
    if (path) void privateAvatar(path).then(value => { if (active) setUrl(value); });
    return () => { active = false; };
  }, [path, revision]);
  return <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#B9AAF0]/10 text-[#B9AAF0]">
    {/* eslint-disable-next-line @next/next/no-img-element */}
    {url ? <img src={url} alt="" className="h-full w-full object-cover" /> : <UserRound size={20} aria-label={label || undefined} />}
  </span>;
}

function PrivacyStatus({ error, copy, retry }) {
  return <div className={panel} role="status"><p className="text-sm leading-6 text-[#BCC7D2]">{error ? copy.unavailable : copy.loading}</p>{error && <button onClick={retry} className={`${secondary} mt-3`}>{copy.refresh}</button>}</div>;
}

export function PrivacyHelp({ copy }) {
  return <details className={panel}>
    <summary className="min-h-11 cursor-pointer text-sm font-semibold leading-6 text-[#67D4F1]">{copy.extra}</summary>
    <p className="mt-3 text-sm leading-6 text-[#BCC7D2]">{copy.extraIntro}</p>
    <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-[#BCC7D2]">{copy.tips.map(tip => <li key={tip}>{tip}</li>)}</ul>
    <Link href="/qari" className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#67D4F1]">{copy.country}<ArrowUpRight size={16} /></Link>
    <p className="text-xs leading-5 text-[#BCC7D2]">{copy.countryHelp}</p>
  </details>;
}

export function MemberPrivacySummary() {
  const { locale } = useLocale();
  const { user } = useAuth();
  const copy = memberPrivacyCopy(locale);
  const { state, error } = usePrivacyState();
  if (!user) return null;
  return <Link href="/privacy-settings" className="mb-4 flex min-h-16 items-center justify-between gap-3 rounded-2xl border border-[#B9AAF0]/25 bg-[#141E2C] px-4 py-3 text-[#F5F1E8] focus-visible:outline-2 focus-visible:outline-[#80D4C4]">
    <span className="flex items-center gap-3"><LockKeyhole size={20} className="shrink-0 text-[#B9AAF0]" aria-hidden="true" /><span><span className="block text-sm font-semibold">{copy.eyebrow}</span><span role="status" className="mt-1 block text-xs text-[#BCC7D2]">{state ? copy[state.profile.audience] : error ? copy.statusUnknown : copy.loading}</span></span></span><ArrowUpRight size={16} className="shrink-0 text-[#80D4C4]" aria-hidden="true" />
  </Link>;
}

export default function MemberPrivacySettings(props) {
  const { user } = useAuth();
  return <MemberPrivacySettingsContent key={user?.id || "guest"} {...props} />;
}

function MemberPrivacySettingsContent({ previewState = null }) {
  const { locale } = useLocale();
  const copy = memberPrivacyCopy(locale);
  const { user, signOut, memberProfile } = useAuth();
  const router = useRouter();
  const privacy = usePrivacyState(!previewState);
  const state = previewState || privacy.state;
  const { error, refresh } = privacy;
  const [draft, setDraft] = useState(normalizeSharedProfile());
  const [adult, setAdult] = useState(false);
  const [rules, setRules] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const dirty = useRef(false);
  useEffect(() => { if (state?.profile && !dirty.current) setDraft(normalizeSharedProfile(state.profile)); }, [state]);
  const change = (key, value) => { dirty.current = true; setDraft(d => ({ ...d, [key]: value })); setNotice(""); };
  const act = async (name, args, success = copy.saved) => {
    if (previewState) return;
    setBusy(true); setNotice("");
    try { await privacyCall(name, args); dirty.current = false; privacyChanged(); await refresh(); setNotice(success); }
    catch { setNotice(copy.error); }
    finally { setBusy(false); }
  };
  const save = async (event) => {
    event.preventDefault();
    if (draft.audience !== "hidden" && !validSharedAlias(draft.alias)) { setNotice(copy.invalidAlias); return; }
    await act("save", { settings: normalizeSharedProfile(draft) });
  };
  const removeAccount = async () => {
    if (!deleteConfirm || previewState) return;
    setBusy(true); setNotice("");
    try {
      const { data } = await supabase.auth.getSession();
      const response = await fetch("/api/account/delete", { method: "POST", headers: { Authorization: `Bearer ${data?.session?.access_token || ""}`, "Content-Type": "application/json" }, body: JSON.stringify({ confirmation: "DELETE" }) });
      const result = await response.json();
      if (!response.ok) { setNotice(result.error === "recent_login_required" ? copy.deleteReauth : result.hidden ? copy.deletePending : copy.error); await refresh(); return; }
      await signOut(); router.replace("/");
    } catch { setNotice(copy.error); } finally { setBusy(false); }
  };
  if (!user && !previewState) return <section className="space-y-4 text-[#F5F1E8]"><header className={panel}><p className="text-xs font-semibold uppercase tracking-wider text-[#B9AAF0]">{copy.eyebrow}</p><h1 className="mt-2 text-2xl font-semibold">{copy.title}</h1><p className="mt-3 text-sm leading-6 text-[#BCC7D2]">{copy.intro}</p><Link href="/?join=true" className={`${primary} mt-4`}>{copy.settings}</Link></header><PrivacyHelp copy={copy} /></section>;
  const preview = sharedProfilePreview(draft);
  const pendingDeletion = Boolean(state?.profile?.deletion_requested_at);
  return <section className="space-y-4 text-[#F5F1E8]" aria-labelledby="privacy-title">
    <header><p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#80D4C4]">{copy.eyebrow}</p><h1 id="privacy-title" className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{copy.title}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-[#BCC7D2]">{copy.intro}</p></header>
    {!state ? <PrivacyStatus error={error} copy={copy} retry={refresh} /> : <>
      {pendingDeletion && <p role="status" className={`${panel} text-sm text-[#F2B38B]`}>{copy.deletePending}</p>}
      {!state.directory_open && <p className={`${panel} text-sm leading-6 text-[#BCC7D2]`}>{copy.staged}</p>}
      {!state.profile.joined_at && !pendingDeletion && <div className={panel}>
        <p className="text-sm leading-6 text-[#BCC7D2]">{copy.joinHelp}</p>
        <label className="mt-3 flex min-h-11 items-center gap-3 text-sm"><input type="checkbox" checked={adult} onChange={e => setAdult(e.target.checked)} className="h-5 w-5 accent-[#80D4C4]" />{copy.adult}</label>
        <label className="flex min-h-11 items-center gap-3 text-sm leading-6"><input type="checkbox" checked={rules} onChange={e => setRules(e.target.checked)} className="h-5 w-5 shrink-0 accent-[#80D4C4]" />{copy.rules}</label>
        <button disabled={!adult || !rules || busy} className={`${primary} mt-3`} onClick={() => act("join", { adult_confirmed: adult, rules_accepted: rules })}>{copy.join}</button>
      </div>}
      <form onSubmit={save} className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <div className={`${panel} space-y-4`}>
          {!state.eligible && state.directory_open && <p className="text-sm leading-6 text-[#F2B38B]">{copy.unlockSharing}</p>}
          <fieldset disabled={busy || pendingDeletion}><legend className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#B9AAF0]"><LockKeyhole size={18} />{copy.eyebrow}</legend>
            {[ ["hidden", EyeOff], ["contacts", LockKeyhole], ["community", Eye] ].map(([audience, Icon]) => <label key={audience} className={`mb-2 flex cursor-pointer items-start gap-3 rounded-xl border p-3 ${draft.audience === audience ? "border-[#B9AAF0]/60 bg-[#B9AAF0]/[0.08]" : "border-[#2B3949]"}`}>
              <input type="radio" name="profile-audience" value={audience} checked={draft.audience === audience} onChange={() => change("audience", audience)} disabled={audience !== "hidden" && !state.eligible} className="mt-1 h-4 w-4 shrink-0 accent-[#B9AAF0]" />
              <span><span className="flex items-center gap-2 text-sm font-semibold"><Icon size={16} aria-hidden="true" />{copy[audience]}</span><span className="mt-1 block text-xs leading-5 text-[#BCC7D2]">{copy[`${audience}Help`]}</span></span>
            </label>)}
          </fieldset>
          <label className="block text-sm">{copy.alias}<input className={field} value={draft.alias} maxLength={40} onChange={e => change("alias", e.target.value)} disabled={pendingDeletion} autoComplete="off" /><span className="mt-2 block text-xs leading-5 text-[#BCC7D2]">{copy.aliasHelp}</span></label>
          <label className="block text-sm">{copy.bio}<textarea className={field} value={draft.bio} maxLength={160} onChange={e => change("bio", e.target.value)} disabled={pendingDeletion} /></label>
          <details><summary className="min-h-11 cursor-pointer text-sm font-semibold text-[#B9AAF0]">{copy.moreFields}</summary><div className="mt-3 space-y-3">
          <label className="block text-sm">{copy.city}<input className={field} value={draft.discovery_city} maxLength={80} onChange={e => change("discovery_city", e.target.value)} disabled={pendingDeletion} /><span className="mt-2 block text-xs leading-5 text-[#BCC7D2]">{copy.cityHelp}</span></label>
          <label className="flex min-h-11 items-center gap-3 text-sm"><input type="checkbox" checked={draft.share_city} onChange={e => change("share_city", e.target.checked)} disabled={pendingDeletion} className="h-5 w-5 accent-[#80D4C4]" />{copy.shareCity}</label>
          <label className="block text-sm">{copy.pronouns}<input className={field} value={draft.shared_pronouns} maxLength={40} onChange={e => change("shared_pronouns", e.target.value)} disabled={pendingDeletion} /></label>
          <label className="flex min-h-11 items-center gap-3 text-sm"><input type="checkbox" checked={draft.share_pronouns} onChange={e => change("share_pronouns", e.target.checked)} disabled={pendingDeletion} className="h-5 w-5 accent-[#80D4C4]" />{copy.sharePronouns}</label>
          <label className="flex min-h-11 items-center gap-3 text-sm"><input type="checkbox" checked={draft.share_avatar} onChange={e => change("share_avatar", e.target.checked)} disabled={pendingDeletion} className="h-5 w-5 accent-[#80D4C4]" />{copy.shareAvatar}</label>
          <p className="text-xs leading-5 text-[#BCC7D2]">{copy.noPhoto}</p>
          </div></details>

        </div>
        <aside className="space-y-4">
          <div className={panel}><p className="text-xs font-semibold uppercase tracking-wider text-[#B9AAF0]">{copy.preview}</p><p className="mt-3 text-sm text-[#80D4C4]">{copy[draft.audience]}</p>
            {draft.audience === "hidden" ? <p className="mt-3 text-sm leading-6 text-[#BCC7D2]">{copy.hiddenHelp}</p> : <div className="mt-4 border-t border-[#2B3949] pt-4"><div className="flex items-center gap-3"><Avatar path={preview.share_avatar ? memberProfile?.avatarPath : ""} revision={state} /><p className="font-semibold">{preview.alias || copy.noAlias}</p></div><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#BCC7D2]">{preview.bio}</p>{preview.discovery_city && <p className="mt-2 text-sm text-[#BCC7D2]">{preview.discovery_city}</p>}{preview.shared_pronouns && <p className="mt-2 text-sm text-[#BCC7D2]">{preview.shared_pronouns}</p>}</div>}
          </div><PrivacyHelp copy={copy} />
        </aside>
        <div className="flex flex-wrap gap-3 lg:col-span-2">
          <button className={primary} disabled={busy || pendingDeletion}>{copy.save}</button>
          <button type="button" className={secondary} disabled={busy || pendingDeletion} onClick={() => act("save", { settings: { ...normalizeSharedProfile(state.profile), audience: "hidden" } })}><EyeOff size={16} />{copy.hide}</button>
        </div>
      </form>
      {!previewState && <ContactControls state={state} refresh={refresh} copy={copy} />}
      <details className={panel}><summary className="min-h-11 cursor-pointer text-sm font-semibold text-[#FDA4AF]">{copy.deleteTitle}</summary><p className="mt-3 text-sm leading-6 text-[#BCC7D2]">{copy.deleteHelp}</p><Link href="/privacy" className="mt-2 inline-block text-sm underline">{copy.eyebrow}</Link>
        {!deleteOpen ? <button onClick={() => setDeleteOpen(true)} className={`${secondary} mt-4 block text-[#FDA4AF]`}>{copy.deleteTitle}</button> : <div className="mt-4"><label className="flex min-h-11 items-start gap-3 text-sm leading-6"><input type="checkbox" checked={deleteConfirm} onChange={e => setDeleteConfirm(e.target.checked)} className="mt-1 h-5 w-5 shrink-0" />{copy.deleteConfirm}</label><div className="mt-3 flex gap-3"><button disabled={!deleteConfirm || busy} onClick={removeAccount} className={`${primary} bg-[#FDA4AF]`}>{copy.delete}</button><button onClick={() => { setDeleteOpen(false); setDeleteConfirm(false); }} className={secondary}>{copy.cancel}</button></div></div>}
      </details>
    </>}
    <p role="status" aria-live="polite" className="text-sm leading-6 text-[#F2B38B]">{notice}</p>
    {notice === copy.deleteReauth && <button className={secondary} onClick={async () => { await signOut(); localStorage.setItem("qa_post_login_target", "/privacy-settings"); router.push("/?join=true"); }}>{copy.reauthenticate}</button>}
  </section>;
}

function ContactControls({ state, refresh, copy }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const act = async (name,args) => { setBusy(true); setError(false); try { await privacyCall(name,args); privacyChanged(); await refresh(); } catch { setError(true); } finally { setBusy(false); } };
  return <div className={panel}><h2 className="text-lg font-semibold">{copy.requests}</h2>
    {!(state.contacts || []).length && <p className="mt-3 text-sm text-[#BCC7D2]">{copy.empty}</p>}
    {(state.contacts || []).map(c => <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2B3949] py-3"><div><p className="text-sm font-semibold">{c.alias || copy.noAlias}</p><p className="mt-1 text-xs text-[#BCC7D2]">{c.state === "accepted" ? copy.accepted : c.incoming ? copy.incoming : copy.pending}</p></div><div className="flex flex-wrap gap-2">
      {c.state === "pending" && c.incoming && <button disabled={busy} className={primary} onClick={() => act("contact",{target:c.user_id,action:"accept"})}>{copy.accept}</button>}
      <button disabled={busy} className={secondary} onClick={() => act("contact",{target:c.user_id,action:c.state === "pending" && c.incoming ? "decline" : "revoke"})}>{c.state === "pending" && c.incoming ? copy.decline : copy.revoke}</button>
      {c.state === "accepted" && <Link className={secondary} href={`/favorites?member=${encodeURIComponent(c.user_id)}`}>{copy.open}</Link>}
      <button disabled={busy} className={`${secondary} text-[#FDA4AF]`} onClick={() => act("block",{target:c.user_id,blocked:true})}>{copy.block}</button></div></div>)}
    {(state.blocks || []).length > 0 && <details className="mt-4"><summary className="min-h-11 cursor-pointer text-sm text-[#B9AAF0]">{copy.blocked} ({state.blocks.length})</summary><p className="text-xs leading-5 text-[#BCC7D2]">{copy.blockedHelp}</p>{state.blocks.map((id,i) => <div key={id} className="mt-2 flex items-center justify-between gap-2 text-sm"><span>{copy.blocked} · {i+1}</span><button disabled={busy} className={secondary} onClick={() => act("block",{target:id,blocked:false})}>{copy.unblock}</button></div>)}</details>}
    {error && <p role="alert" className="mt-3 text-sm text-[#F2B38B]">{copy.error}</p>}
  </div>;
}

export function PrivateMemberProfile({ target, onBack }) {
  const router = useRouter();
  const { user } = useAuth();
  const { locale } = useLocale();
  const copy = memberPrivacyCopy(locale);
  const [profile,setProfile] = useState(null);
  const [viewer,setViewer] = useState("");
  const [loading,setLoading] = useState(true);
  const [notice,setNotice] = useState("");
  const [busy,setBusy] = useState(false);
  const [reportOpen,setReportOpen] = useState(false);
  const [reason,setReason] = useState("stalking");
  const [details,setDetails] = useState("");
  const { state } = usePrivacyState();
  useEffect(() => {
    let active=true;
    let generation=0;
    const load=async () => { const request=++generation; try { const data=await privacyCall("profile",{target}); if(active&&request===generation) { setProfile(data); setViewer(user?.id||""); setLoading(false); } } catch { if(active&&request===generation) { setProfile(null); setLoading(false); } } };
    queueMicrotask(() => { if(active) { setProfile(null); setLoading(true); void load(); } });
    const clear=()=>{generation++;setProfile(null);};
    const recheck=()=>{if(document.visibilityState==='visible')void load();else clear();};
    const timer=setInterval(recheck,15_000);
    window.addEventListener(PRIVACY_CHANGED,recheck); window.addEventListener('offline',clear); document.addEventListener('visibilitychange',recheck);
    return()=>{active=false;clearInterval(timer);window.removeEventListener(PRIVACY_CHANGED,recheck);window.removeEventListener('offline',clear);document.removeEventListener('visibilitychange',recheck);};
  },[target,user?.id]);
  const act=async(name,args)=>{setBusy(true);setNotice("");try{await privacyCall(name,args);privacyChanged();if(name==='block')setProfile(null);else setNotice(name==='report'?copy.reported:copy.pending);}catch{setNotice(copy.error);}finally{setBusy(false);}};
  return <section className={`${panel} text-[#F5F1E8]`}><button onClick={onBack || (()=>router.push('/community'))} className={secondary}>{copy.back}</button>
    {!profile || !user || viewer!==user.id ? <p role="status" className="mt-4 text-sm text-[#BCC7D2]">{loading?copy.loading:copy.profileUnavailable}</p> : <>
      <div className="mt-5 flex items-center gap-3"><Avatar path={profile.avatar_path} revision={profile} /><h2 className="text-xl font-semibold">{profile.alias}</h2></div><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#BCC7D2]">{profile.bio}</p>{profile.discovery_city && <p className="mt-2 text-sm text-[#BCC7D2]">{profile.discovery_city}</p>}{profile.shared_pronouns && <p className="mt-2 text-sm text-[#BCC7D2]">{profile.shared_pronouns}</p>}
      <div className="mt-5 flex flex-wrap gap-3">{profile.contact ? <Link className={primary} href={`/messages?user=${encodeURIComponent(target)}`}>{copy.message}</Link> : <button className={primary} disabled={busy || !validSharedAlias(state?.profile?.alias)} onClick={()=>act('contact',{target,action:'request'})}>{copy.request}</button>}<button className={`${secondary} text-[#FDA4AF]`} disabled={busy} onClick={()=>act('block',{target,blocked:true})}>{copy.block}</button><button className={secondary} onClick={()=>setReportOpen(v=>!v)}>{copy.report}</button></div>
      {!profile.contact && <p className="mt-3 text-xs leading-5 text-[#BCC7D2]">{copy.requestHelp} <Link href="/privacy-settings" className="underline">{copy.alias}</Link></p>}
      {reportOpen && <form className="mt-5 space-y-3 border-t border-[#2B3949] pt-4" onSubmit={e=>{e.preventDefault();void act('report',{target,reason,details});}}><label className="block text-sm">{copy.reason}<select className={field} value={reason} onChange={e=>setReason(e.target.value)}>{['stalking','outing','impersonation','unwanted_contact','other'].map(r=><option key={r} value={r}>{copy[r]}</option>)}</select></label><label className="block text-sm">{copy.details}<textarea className={field} value={details} maxLength={1000} onChange={e=>setDetails(e.target.value)} /></label><button className={primary} disabled={busy}>{copy.sendReport}</button></form>}
    </>}<p role="status" className="mt-3 text-sm text-[#F2B38B]">{notice}</p>
  </section>;
}

export function PrivateMemberDirectory() {
  const { locale } = useLocale();
  const copy = memberPrivacyCopy(locale);
  const { state,error,refresh } = usePrivacyState();
  const [query,setQuery] = useState("");
  const [rows,setRows] = useState([]);
  const [page,setPage] = useState(0);
  const [loading,setLoading] = useState(false);
  const [failed,setFailed] = useState(false);
  const [selected,setSelected] = useState("");
  const sequence=useRef(0);
  const visibleIds=useRef([]);
  const search=useCallback(async(text,offset)=>{
    const n=++sequence.current;setRows([]);setLoading(true);setFailed(false);
    try{const data=await privacyCall('search',{query_text:text,city:'',page:offset});if(n===sequence.current){const next=Array.isArray(data)?data.filter(Boolean):[];visibleIds.current=next.map(r=>r.user_id);setRows(next);setPage(offset);}}
    catch{if(n===sequence.current){setRows([]);setFailed(true);}}
    finally{if(n===sequence.current)setLoading(false);}
  },[]);
  const eligible=Boolean(state?.eligible);
  useEffect(()=>{
    let active=true;
    // No cached or ranking fallback. Re-fetch every access-sensitive result.
    queueMicrotask(()=>{if(!active)return;if(eligible)void search('',0);else{sequence.current++;visibleIds.current=[];setRows([]);}});
    const clear=()=>{sequence.current++;visibleIds.current=[];setRows([]);};
    const recheck=async()=>{
      if(document.visibilityState!=='visible'){clear();return;}
      if(!eligible||!visibleIds.current.length)return;
      const n=++sequence.current;
      try{const next=await privacyCall('refresh',{targets:visibleIds.current});if(active&&n===sequence.current){setRows((next||[]).filter(Boolean));visibleIds.current=(next||[]).filter(Boolean).map(r=>r.user_id);}}
      catch{if(active&&n===sequence.current)clear();}
    };
    const timer=setInterval(recheck,15_000);
    window.addEventListener('offline',clear);
    document.addEventListener('visibilitychange',recheck);
    return()=>{active=false;clear();clearInterval(timer);window.removeEventListener('offline',clear);document.removeEventListener('visibilitychange',recheck);};
  },[eligible,search]);
  if(selected)return <PrivateMemberProfile target={selected} onBack={()=>{setSelected('');void refresh();}} />;
  return <section className="space-y-4 text-[#F5F1E8]"><header className={panel}><p className="text-xs font-semibold uppercase tracking-wider text-[#B9AAF0]">{copy.eyebrow}</p><h2 className="mt-2 text-2xl font-semibold">{copy.directory}</h2><p className="mt-3 text-sm leading-6 text-[#BCC7D2]">{copy.directoryIntro}</p><Link href="/privacy-settings" className={`${secondary} mt-4`}><Shield size={16} />{copy.settings}</Link></header>
    {!state?<PrivacyStatus copy={copy} error={error} retry={refresh} />:!state.eligible?<div className={panel}><p className="text-sm leading-6 text-[#BCC7D2]">{state.directory_open?copy.joinHelp:copy.staged}</p><Link href="/privacy-settings" className={`${primary} mt-3`}>{copy.settings}</Link></div>:<>
      <form onSubmit={e=>{e.preventDefault();void search(query,0);}} className="flex items-end gap-3"><label className="min-w-0 flex-1 text-sm">{copy.search}<input className={field} value={query} maxLength={80} onChange={e=>setQuery(e.target.value)} autoComplete="off" /></label><button className={primary} disabled={loading}>{copy.searchButton}</button></form>
      <div className="divide-y divide-[#2B3949] rounded-[22px] bg-[#141E2C] px-4 sm:px-6">{rows.map(row=><button key={row.user_id} onClick={()=>setSelected(row.user_id)} className="flex min-h-20 w-full items-center gap-3 py-4 text-left focus-visible:outline-2 focus-visible:outline-[#80D4C4]"><Avatar path={row.avatar_path} revision={state} /><span className="min-w-0 flex-1"><span className="block truncate text-base font-semibold">{row.alias}</span><span className="mt-1 block line-clamp-2 text-sm text-[#BCC7D2]">{row.bio}</span>{row.discovery_city && <span className="mt-1 block text-xs text-[#BCC7D2]">{row.discovery_city}</span>}</span><ArrowUpRight size={16} className="shrink-0 text-[#B9AAF0]" aria-hidden="true" /></button>)}</div>
      <p role="status" className="text-sm leading-6 text-[#BCC7D2]">{loading?copy.loading:failed?copy.unavailable:!rows.length?copy.empty:''}</p>{rows.length===20 && page<4 && <button className={secondary} onClick={()=>search(query,page+1)} disabled={loading}>{copy.more}</button>}
      <ContactControls state={state} refresh={refresh} copy={copy} />
    </>}
  </section>;
}
