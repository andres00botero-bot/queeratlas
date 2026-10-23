"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { supabase } from "@/lib/supabase";
import { cityPath } from "@/lib/cityRouting";

// Invitations retain their own participant permissions, separately from DMs.
export default function PrivateEventRequests() {
  const {user}=useAuth();
  const {locale}=useLocale();
  const es=locale==='es';
  const [rows,setRows]=useState([]);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState(false);
  const load=async()=>{
    if(!user?.id)return;
    setBusy(true);setRows([]);setError(false);
    try{
      const fields='id,city,title,host_alias,host_user_id,start_at';
      const hosted=await supabase.from('qa_private_events').select(fields).eq('host_user_id',user.id).limit(80);
      if(hosted.error)throw hosted.error;
      const ids=(hosted.data||[]).map(e=>e.id);
      const [mine,incoming]=await Promise.all([
        supabase.from('qa_private_event_invites').select('id,event_id,status,message,created_at,requester_user_id').eq('requester_user_id',user.id).order('created_at',{ascending:false}).limit(50),
        ids.length?supabase.from('qa_private_event_invites').select('id,event_id,status,message,created_at,requester_user_id').in('event_id',ids).order('created_at',{ascending:false}).limit(50):Promise.resolve({data:[]}),
      ]);
      if(mine.error||incoming.error)throw Error('unavailable');
      const missing=[...new Set((mine.data||[]).map(r=>r.event_id).filter(id=>!ids.includes(id)))];
      const other=missing.length?await supabase.from('qa_private_events').select(fields).in('id',missing):{data:[]};
      if(other.error)throw other.error;
      const events=new Map([...(hosted.data||[]),...(other.data||[])].map(e=>[e.id,e]));
      setRows([...(mine.data||[]).map(r=>({...r,incoming:false})),...(incoming.data||[]).map(r=>({...r,incoming:true}))].map(r=>({...r,event:events.get(r.event_id)})).filter(r=>r.event));
    }catch{setRows([]);setError(true);}finally{setBusy(false);}
  };
  return <details className="rounded-[22px] border border-[#2B3949] bg-[#141E2C] p-4 text-[#F5F1E8]" onToggle={e=>{if(e.currentTarget.open)void load();else setRows([]);}}>
    <summary className="min-h-11 cursor-pointer text-sm font-semibold text-[#B9AAF0]">{es?'Solicitudes de eventos privados':'Private event requests'}</summary>
    <p className="mt-2 text-xs leading-5 text-[#BCC7D2]">{es?'Las invitaciones y los mensajes privados son independientes. Para enviar mensajes, ambas personas deben aprobar el contacto.':'Event invitations and private messages are separate. Both people must approve contact before exchanging messages.'}</p>
    {busy&&<p role="status" className="mt-3 text-sm text-[#BCC7D2]">{es?'Cargando…':'Loading…'}</p>}
    {error&&<p role="alert" className="mt-3 text-sm text-[#F2B38B]">{es?'No se pueden cargar las solicitudes.':'Requests could not be loaded.'}</p>}
    {!busy&&!error&&!rows.length&&<p className="mt-3 text-sm text-[#BCC7D2]">{es?'No hay solicitudes.':'No requests to show.'}</p>}
    {rows.map(r=><article key={`${r.incoming}:${r.id}`} className="mt-3 border-t border-[#2B3949] pt-3"><h2 className="text-base font-semibold">{r.event.title}</h2><p className="mt-1 text-xs text-[#BCC7D2]">{r.incoming?(es?'Solicitud recibida':'Incoming request'):(es?'Tu solicitud':'Your request')} · {r.status}</p>{r.message&&<p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#BCC7D2]">{r.message}</p>}<Link href={cityPath(r.event.city)} className="mt-2 inline-flex min-h-11 items-center text-sm font-semibold text-[#80D4C4]">{es?'Abrir ciudad':'Open city'} ↗</Link></article>)}
  </details>;
}
