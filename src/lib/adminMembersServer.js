// Only server routes supply the privileged client. Keep the response projection
// explicit: never return the full Auth user (identities, tokens or metadata).
export function createAdminMembersHandlers({ authorize, getService }) {
  const reply = (body, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "private, no-store", Vary: "Authorization" } });
  const audit = async (service, actor, action) => {
    const { error } = await service.from("qa_member_privacy_audit").insert({ actor, action });
    if (error) throw new Error("audit_unavailable");
  };
  return {
    async GET(request) {
      try {
        const operator = await authorize(request);
        if (!operator) return reply({ error: "forbidden" }, 403);
        const page = Number(new URL(request.url).searchParams.get("page") || 1);
        if (!Number.isSafeInteger(page) || page < 1 || page > 100000) return reply({ error: "invalid_page" }, 400);
        const perPage = 100;
        const service = getService();
        await audit(service, operator.id, `admin_members_list:page=${page}`);
        const { data, error } = await service.auth.admin.listUsers({ page, perPage });
        if (error) throw error;
        const accounts = data?.users || [];
        const ids = accounts.map(account => account.id);
        let profiles = [], privacy = [];
        if (ids.length) {
          const [profileResult, privacyResult] = await Promise.all([
            service.from("member_profiles").select("user_id,display_name,home_city,resident_country,trusted_contributor,updated_at").in("user_id", ids),
            service.from("qa_member_privacy").select("user_id,audience,deletion_requested_at").in("user_id", ids),
          ]);
          if (profileResult.error || privacyResult.error) throw new Error("profiles_unavailable");
          profiles = profileResult.data || []; privacy = privacyResult.data || [];
        }
        const byId = new Map(profiles.map(profile => [profile.user_id, profile]));
        const privacyById = new Map(privacy.map(profile => [profile.user_id, profile]));
        const members = accounts.map(account => {
          const profile = byId.get(account.id);
          const sharing = privacyById.get(account.id);
          return {
            user_id: account.id, email: account.email || "", created_at: account.created_at || "",
            email_confirmed: Boolean(account.email_confirmed_at), has_profile: Boolean(profile),
            display_name: profile?.display_name || "", home_city: profile?.home_city || "",
            resident_country: profile?.resident_country || "", trusted_contributor: Boolean(profile?.trusted_contributor),
            audience: sharing?.audience || "hidden", deletion_pending: Boolean(sharing?.deletion_requested_at),
          };
        });
        // Do not rely on SDK nextPage parsing: some versions truncate 2-digit pages.
        const count = Number(data?.total);
        const total = Number.isSafeInteger(count) && count >= (page - 1) * perPage + accounts.length ? count : null;
        const hasMore = accounts.length === perPage && (total === null || page * perPage < total);
        return reply({ members, total, nextPage: hasMore ? page + 1 : null });
      } catch { return reply({ error: "members_unavailable" }, 503); }
    },
    async PATCH(request) {
      try {
        const operator = await authorize(request);
        if (!operator) return reply({ error: "forbidden" }, 403);
        const origin = request.headers.get("origin");
        if (origin && origin !== new URL(request.url).origin) return reply({ error: "forbidden" }, 403);
        const body = await request.json().catch(() => null);
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(body?.user_id || "") ||
          typeof body?.trusted_contributor !== "boolean" || Object.keys(body).some(key => !["user_id", "trusted_contributor"].includes(key))) {
          return reply({ error: "invalid_request" }, 400);
        }
        const service = getService();
        const { data: identity, error: identityError } = await service.auth.admin.getUserById(body.user_id);
        if (identityError || !identity?.user) return reply({ error: "account_not_found" }, 404);
        await audit(service, operator.id, `admin_publishing_attempt:${body.user_id}:${body.trusted_contributor}`);
        const existing = await service.from("member_profiles").select("user_id").eq("user_id", body.user_id).maybeSingle();
        if (existing.error) throw existing.error;
        const update = () => service.from("member_profiles").update({ trusted_contributor: body.trusted_contributor }).eq("user_id", body.user_id).select("user_id").single();
        let result = existing.data ? await update() : await service.from("member_profiles").insert({
          user_id: body.user_id, display_name: "Member", trusted_contributor: body.trusted_contributor,
        }).select("user_id").single();
        if (result.error?.code === "23505") result = await update();
        if (result.error) throw result.error;
        return reply({ ok: true, user_id: body.user_id, trusted_contributor: body.trusted_contributor });
      } catch { return reply({ error: "update_failed" }, 503); }
    },
  };
}
