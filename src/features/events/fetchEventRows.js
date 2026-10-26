// Fetch every page: PostgREST's default row limit must not hide later events.
export async function fetchEventRows(client, pageSize = 1000) {
  const rows = [];
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await client.from("events").select("*")
      .order("date", { ascending: true })
      .order("id", { ascending: true })
      .range(from, from + pageSize - 1);
    if (error) return { data: rows, error };
    rows.push(...(data || []));
    if ((data || []).length < pageSize) return { data: rows, error: null };
  }
}
