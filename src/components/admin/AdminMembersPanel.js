"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useLocale } from "@/components/i18n/LocaleProvider";

const button = "inline-flex min-h-11 items-center justify-center rounded-xl border border-[#80D4C4]/35 px-3 py-2 text-sm font-semibold text-[#80D4C4] disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#80D4C4]";
const empty = { owner: "", rows: [], total: null, loading: false, error: false };
async function requestMembers(url, token, options = {}) {
  const response = await fetch(url, { ...options, cache: "no-store", signal: AbortSignal.timeout(20000), headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } });
  const data = await response.json();
  if (!response.ok) throw new Error("members_unavailable");
  return data;
}
export default function AdminMembersPanel() {
  const { user, session } = useAuth();
  const { locale } = useLocale();
  const es = locale === "es";
  const [result, setResult] = useState(empty);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [busy, setBusy] = useState("");
  const [notice, setNotice] = useState("");
  const generation = useRef(0);
  const userId = user?.id || "";
  const token = session?.access_token;
  const load = useCallback(async () => {
    const run = ++generation.current;
    if (!userId || !token) { setResult(empty); return; }
    const owner = userId;
    setResult({ ...empty, owner, loading: true }); setPage(1); setNotice("");
    try {
      const accounts = new Map();
      let next = 1;
      let total = null;
      while (next) {
        const data = await requestMembers(`/api/admin/members?page=${next}`, token);
        if (run !== generation.current) return;
        for (const member of data.members || []) accounts.set(member.user_id, member);
        total = data.total;
        setResult({ owner, rows: [...accounts.values()], total, loading: Boolean(data.nextPage), error: false });
        if (data.nextPage && data.nextPage <= next) throw new Error("invalid_pagination");
        next = data.nextPage;
      }
    } catch {
      if (run === generation.current) setResult({ ...empty, owner, error: true });
    }
  }, [userId, token]);
  useEffect(() => {
    let active = true;
    const clear = () => { generation.current++; setResult(empty); setSearch(""); setNotice(""); setBusy(""); };
    const visibility = () => { if (document.visibilityState === "visible") void load(); else clear(); };
    queueMicrotask(() => { if (active) void load(); });
    window.addEventListener("offline", clear);
    window.addEventListener("qa:admin-members-refresh", load);
    document.addEventListener("visibilitychange", visibility);
    return () => { active = false; clear(); window.removeEventListener("offline", clear); window.removeEventListener("qa:admin-members-refresh", load); document.removeEventListener("visibilitychange", visibility); };
  }, [load]);
  const rows = result.owner === userId ? result.rows : empty.rows;
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return rows.filter(row => !query || [row.email, row.display_name, row.user_id, row.home_city, row.resident_country].join(" ").toLowerCase().includes(query));
  }, [rows, search]);
  const pages = Math.max(1, Math.ceil(filtered.length / 50));
  const currentPage = Math.min(page, pages);
  const visible = filtered.slice((currentPage - 1) * 50, currentPage * 50);
  const toggle = async row => {
    const run = generation.current;
    setBusy(row.user_id); setNotice("");
    try {
      const data = await requestMembers("/api/admin/members", token, { method: "PATCH", body: JSON.stringify({ user_id: row.user_id, trusted_contributor: !row.trusted_contributor }) });
      if (run !== generation.current) return;
      setResult(current => ({ ...current, rows: current.rows.map(member => member.user_id === row.user_id ? { ...member, trusted_contributor: data.trusted_contributor, has_profile: true } : member) }));
      setNotice(es ? "Permiso de publicación actualizado." : "Publishing permission updated.");
    } catch { if (run === generation.current) setNotice(es ? "No se pudo confirmar el cambio. Actualiza la lista." : "The change could not be confirmed. Refresh the list."); }
    finally { if (run === generation.current) setBusy(""); }
  };
  const sharing = { hidden: es ? "Oculto" : "Hidden", contacts: es ? "Contactos" : "Contacts", community: es ? "Visible" : "Discoverable" };
  return <section className="mb-8 rounded-[26px] border border-[#2B3949] bg-[#141E2C] p-4 text-[#F5F1E8] sm:p-6">
    <header className="mb-4 flex flex-wrap items-start justify-between gap-3"><div>
      <p className="text-xs font-semibold uppercase tracking-wider text-[#B9AAF0]">{es ? "Administración de cuentas" : "Account administration"}</p>
      <h2 className="mt-2 text-xl font-semibold">{es ? "Miembros y permisos" : "Members & access"}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-[#BCC7D2]">{es ? "Todas las cuentas registradas, incluidos los perfiles ocultos y las cuentas sin perfil." : "All registered accounts, including hidden profiles and accounts without a profile."}</p>
    </div><div className="flex flex-wrap items-center gap-2"><span className="text-sm text-[#BCC7D2]">{es ? "Cuentas" : "Accounts"}: {result.total ?? rows.length}{result.loading ? ` · ${rows.length} ${es ? "cargadas" : "loaded"}` : ""}</span><button onClick={load} disabled={result.loading} className={button}>{es ? "Actualizar" : "Refresh"}</button><Link href="/admin/privacy" className={button}>{es ? "Informes de privacidad" : "Privacy reports"}</Link></div></header>
    <label className="block text-sm text-[#BCC7D2]">{es ? "Buscar cuentas" : "Search accounts"}<input value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} placeholder={es ? "Correo, nombre, ciudad, país o ID" : "Email, name, city, country or ID"} className="mt-2 min-h-11 w-full rounded-xl border border-[#3B5060] bg-[#0B1220] px-3 text-base text-[#F5F1E8] focus-visible:outline-2 focus-visible:outline-[#80D4C4]" /></label>
    {result.error && <p role="alert" className="mt-3 text-sm text-[#F2B38B]">{es ? "No se pudieron cargar las cuentas. Comprueba tu acceso de administrador y vuelve a intentarlo." : "Accounts could not be loaded. Check your administrator access and try again."}</p>}
    {result.loading && <p role="status" className="mt-3 text-sm text-[#BCC7D2]">{es ? "Cargando todas las cuentas…" : "Loading all accounts…"}</p>}
    <div className="mt-4 overflow-x-auto rounded-2xl border border-[#2B3949]"><table className="w-full text-left text-sm"><thead className="bg-[#0B1220] text-xs text-[#BCC7D2]"><tr>{[es ? "Cuenta" : "Account", es ? "Registro" : "Registered", es ? "Perfil" : "Profile", es ? "Publicación" : "Publishing"].map(label => <th key={label} className="px-3 py-3">{label}</th>)}</tr></thead><tbody>
      {visible.map(row => <tr key={row.user_id} className="border-t border-[#2B3949]"><td className="px-3 py-3"><p className="font-medium">{row.display_name || (es ? "Sin perfil" : "No profile yet")}</p><p className="mt-1 break-all text-[#BCC7D2]">{row.email || "—"}</p><p className="mt-1 break-all text-xs text-[#BCC7D2]">{row.user_id}</p></td><td className="px-3 py-3 text-[#BCC7D2]"><p>{row.created_at ? new Date(row.created_at).toLocaleDateString(es ? "es" : "en") : "—"}</p><p className="mt-1 text-xs">{row.email_confirmed ? (es ? "Correo confirmado" : "Email confirmed") : (es ? "Correo pendiente" : "Email pending")}</p></td><td className="px-3 py-3 text-[#B9AAF0]">{row.deletion_pending ? (es ? "Eliminación pendiente" : "Deletion pending") : sharing[row.audience] || sharing.hidden}</td><td className="px-3 py-3"><p className="mb-2 text-xs text-[#BCC7D2]">{row.trusted_contributor ? (es ? "Puede publicar" : "Can publish") : (es ? "Estándar" : "Standard")}</p><button disabled={Boolean(busy)} onClick={() => toggle(row)} className={button}>{busy === row.user_id ? (es ? "Guardando…" : "Saving…") : row.trusted_contributor ? (es ? "Revocar permiso" : "Revoke publishing") : (es ? "Permitir publicación" : "Allow publishing")}</button></td></tr>)}
      {!visible.length && !result.loading && !result.error && <tr><td colSpan={4} className="px-3 py-6 text-[#BCC7D2]">{es ? "No hay cuentas que coincidan." : "No matching accounts."}</td></tr>}
    </tbody></table></div>
    <footer className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm text-[#BCC7D2]"><p>{filtered.length} {es ? "resultados" : "results"} · {es ? "Página" : "Page"} {currentPage}/{pages}</p><div className="flex gap-2"><button className={button} disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)}>{es ? "Anterior" : "Previous"}</button><button className={button} disabled={currentPage >= pages} onClick={() => setPage(currentPage + 1)}>{es ? "Siguiente" : "Next"}</button></div></footer>
    {notice && <p role="status" className="mt-3 text-sm text-[#F2B38B]">{notice}</p>}
  </section>;
}
