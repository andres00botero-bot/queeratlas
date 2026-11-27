"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { useLocale } from "@/components/i18n/LocaleProvider";

const labels = {
  en: ["Venue photos", "Manage photos", "Done", "Add image", "Replace", "Remove", "Close", "JPEG, PNG or WebP · up to 3 MB per image", "Could not save the change. Please try again.", "Remove this image?"],
  es: ["Fotos del lugar", "Gestionar fotos", "Listo", "Añadir imagen", "Reemplazar", "Eliminar", "Cerrar", "JPEG, PNG o WebP · hasta 3 MB por imagen", "No se pudo guardar el cambio. Inténtalo de nuevo.", "¿Eliminar esta imagen?"],
  fr: ["Photos du lieu", "Gérer les photos", "Terminé", "Ajouter une image", "Remplacer", "Supprimer", "Fermer", "JPEG, PNG ou WebP · 3 Mo maximum par image", "Impossible d’enregistrer la modification. Réessayez.", "Supprimer cette image ?"],
  de: ["Fotos vom Ort", "Fotos verwalten", "Fertig", "Bild hinzufügen", "Ersetzen", "Entfernen", "Schließen", "JPEG, PNG oder WebP · bis zu 3 MB pro Bild", "Änderung konnte nicht gespeichert werden. Bitte erneut versuchen.", "Dieses Bild entfernen?"],
  pt: ["Fotografias do local", "Gerir fotografias", "Concluir", "Adicionar imagem", "Substituir", "Remover", "Fechar", "JPEG, PNG ou WebP · até 3 MB por imagem", "Não foi possível guardar a alteração. Tente novamente.", "Remover esta imagem?"],
};

export default function VenueGallery({ venue }) {
  const { user } = useAuth();
  return <Gallery key={`${venue.id}-${user?.id || "guest"}`} venue={venue} signedIn={Boolean(user?.id)} />;
}

function Gallery({ venue, signedIn }) {
  const { locale } = useLocale();
  const [title, manage, done, add, replace, remove, close, formats, failure, confirmRemove] = labels[locale] || labels.en;
  const [gallery, setGallery] = useState(null);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const sending = ({ en: "Uploading", es: "Subiendo", fr: "Envoi en cours", de: "Wird hochgeladen", pt: "A carregar" })[locale] || "Uploading";
  const [preview, setPreview] = useState(null);
  const dialog = useRef(null);
  const endpoint = `/api/venues/${encodeURIComponent(venue.id)}/gallery`;
  const call = useCallback(async (method, slot, file, signal) => {
    const token = signedIn && (await supabase.auth.getSession()).data.session?.access_token;
    const response = await fetch(endpoint + (slot ? `?slot=${slot}` : ""), {
      method, signal, cache: "no-store", body: file, headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error(String(response.status));
    return response.json();
  }, [endpoint, signedIn]);

  useEffect(() => {
    const ctrl = new AbortController();
    call("GET", null, undefined, ctrl.signal).then(setGallery).catch(() => {});
    return () => ctrl.abort();
  }, [call]);

  async function change(slot, file) {
    setNotice("");
    if (file && (file.size > 3 * 1024 * 1024 || !["image/jpeg", "image/png", "image/webp"].includes(file.type))) {
      setError(`${file.name} — ${formats}`); return;
    }
    if (!file && !window.confirm(confirmRemove)) return;
    setBusy(true);
    if (file) setNotice(`${sending}…`);
    setError("");
    try {
      await call(file ? "PUT" : "DELETE", slot, file);
      setGallery(await call("GET"));
    } catch (err) { setError(["413", "415"].includes(err.message) ? formats : failure); }
    finally { setBusy(false); setNotice(""); }
  }

  if (!gallery || (!gallery.canEdit && !gallery.photos.length)) return null;
  return <section aria-label={title} className="my-5">
    {gallery.canEdit && <div className="flex justify-end">
      <button type="button" aria-expanded={editing} className="min-h-11 text-sm text-cyan-200 underline" onClick={() => setEditing(!editing)}>{editing ? done : manage}</button>
    </div>}
    {editing && <p className="my-2 text-sm text-white/75">{formats}</p>}
    <p role="status" className="text-sm text-cyan-100">{notice}</p>
    {error && <p role="alert" className="text-sm text-rose-200">{error}</p>}
    <div className="mt-2 grid w-full max-w-lg grid-cols-4 gap-1.5 sm:gap-2">
      {[1, 2, 3, 4].map(slot => {
        const photo = gallery.photos.find(item => item.slot === slot);
        if (!photo && !editing) return null;
        return <div key={slot} className="min-w-0">
          {photo && <button type="button" className="group block aspect-[4/3] w-full cursor-zoom-in overflow-hidden rounded-lg outline-offset-2 focus-visible:outline-2 focus-visible:outline-cyan-300" onClick={() => { setPreview(photo); dialog.current?.showModal(); }}>
            <img src={photo.url} alt={`${venue.name} · ${title} ${slot}`} className="block h-full w-full object-cover motion-safe:transition-transform motion-safe:group-hover:scale-105" />
          </button>}
          {editing && <div className="flex flex-wrap gap-x-3 text-sm">
            <label className="inline-flex min-h-11 cursor-pointer items-center text-cyan-100 underline focus-within:ring-2">{photo ? replace : add} {slot}
              <input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={e => { const file = e.target.files?.[0]; e.target.value = ""; if (file) void change(slot, file); }} />
            </label>
            {photo && <button type="button" disabled={busy} onClick={() => change(slot)} className="min-h-11 text-rose-200">{remove}</button>}
          </div>}
        </div>;
      })}
    </div>
    <dialog ref={dialog} aria-label={title} className="m-auto max-h-[90dvh] max-w-[92vw] rounded-xl bg-[#181421] p-3 text-white backdrop:bg-black/80">
      <button type="button" className="mb-2 min-h-11 underline" onClick={() => dialog.current?.close()}>{close}</button>
      {preview && <img src={preview.url} alt={`${venue.name} · ${title} ${preview.slot}`} className="max-h-[72dvh] max-w-full object-contain" />}
    </dialog>
  </section>;
}
