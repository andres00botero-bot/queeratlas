export function summarizeSearchPerformance({ totalRow = null, pageRows = [], queryPageRows = [] } = {}) {
  const totals = {
    clicks: Number(totalRow?.clicks || 0),
    impressions: Number(totalRow?.impressions || 0),
    ctr: Number(totalRow?.ctr || 0),
    position: Number(totalRow?.position || 0),
  };

  const topPages = [...pageRows]
    .sort((a, b) => Number(b.impressions || 0) - Number(a.impressions || 0))
    .slice(0, 20);
  const zeroClickPages = pageRows
    .filter((row) => Number(row.impressions || 0) > 0 && Number(row.clicks || 0) === 0)
    .sort((a, b) => Number(b.impressions || 0) - Number(a.impressions || 0))
    .slice(0, 30);

  const queryGroups = new Map();
  for (const row of queryPageRows) {
    const query = String(row.query || "").trim();
    const page = String(row.page || "").trim();
    if (!query || !page) continue;
    if (!queryGroups.has(query)) queryGroups.set(query, []);
    queryGroups.get(query).push(row);
  }

  const overlappingQueries = [...queryGroups.entries()]
    .map(([query, rows]) => ({
      query,
      pages: [...new Set(rows.map((row) => row.page))],
      impressions: rows.reduce((sum, row) => sum + Number(row.impressions || 0), 0),
      clicks: rows.reduce((sum, row) => sum + Number(row.clicks || 0), 0),
    }))
    .filter((row) => row.pages.length > 1)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 30);

  return {
    totals,
    topPages,
    zeroClickPages,
    overlappingQueries,
    rowsReceived: {
      pages: pageRows.length,
      queryPages: queryPageRows.length,
    },
  };
}
export function mapSearchAnalyticsRows(rows = [], dimensions = []) {
  return rows.map((row) => {
    const values = Array.isArray(row?.keys) ? row.keys : [];
    const mapped = dimensions.reduce((result, key, index) => {
      result[key] = String(values[index] || "");
      return result;
    }, {});
    return {
      ...mapped,
      clicks: Number(row?.clicks || 0),
      impressions: Number(row?.impressions || 0),
      ctr: Number(row?.ctr || 0),
      position: Number(row?.position || 0),
    };
  });
}
