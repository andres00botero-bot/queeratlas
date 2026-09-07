import { readFileSync, existsSync } from "node:fs";

const reports = [
  ".next/analyze/client.html",
  ".next/analyze/nodejs.html",
  ".next/analyze/edge.html",
];

const clientBudgets = {
  // Per-entrypoint limits represent what one route initially loads. Summing every
  // route chunk made the old gate grow with route count and did not measure a
  // user's initial payload.
  maxEntrypointAssets: 16,
  maxEntrypointParsed: 850_000,
  maxEntrypointGzip: 240_000,
  maxTotalAssets: 150,
  maxAssetParsed: 1_100_000,
  maxAssetGzip: 300_000,
};

function parseChartData(html, reportPath) {
  const match = html.match(/window\.chartData\s*=\s*(\[[\s\S]*?\]);/);
  if (!match) {
    throw new Error(`${reportPath}: missing window.chartData payload`);
  }
  return JSON.parse(match[1]);
}

function getAssetStats(chartData) {
  const assets = chartData.filter((item) => item && item.isAsset);
  const entrypoints = new Map();
  for (const asset of assets) {
    for (const entrypoint of Object.keys(asset.isInitialByEntrypoint || {})) {
      const row = entrypoints.get(entrypoint) || { entrypoint, assetCount: 0, parsed: 0, gzip: 0 };
      row.assetCount += 1;
      row.parsed += Number(asset?.parsedSize) || 0;
      row.gzip += Number(asset?.gzipSize) || 0;
      entrypoints.set(entrypoint, row);
    }
  }
  const entrypointRows = [...entrypoints.values()];
  const worstParsed = entrypointRows.reduce((worst, row) => row.parsed > (worst?.parsed || 0) ? row : worst, null);
  const worstGzip = entrypointRows.reduce((worst, row) => row.gzip > (worst?.gzip || 0) ? row : worst, null);
  const worstAssetCount = entrypointRows.reduce((worst, row) => row.assetCount > (worst?.assetCount || 0) ? row : worst, null);

  return {
    assets,
    assetCount: assets.length,
    entrypointRows,
    worstParsed,
    worstGzip,
    worstAssetCount,
    maxAssetParsed: Math.max(0, ...assets.map((item) => Number(item?.parsedSize) || 0)),
    maxAssetGzip: Math.max(0, ...assets.map((item) => Number(item?.gzipSize) || 0)),
  };
}

const failures = [];

for (const reportPath of reports) {
  if (!existsSync(reportPath)) {
    failures.push(`${reportPath}: missing report file`);
    continue;
  }

  const html = readFileSync(reportPath, "utf8");
  let chartData;
  try {
    chartData = parseChartData(html, reportPath);
  } catch (error) {
    failures.push(error instanceof Error ? error.message : `${reportPath}: invalid chartData`);
    continue;
  }

  if (reportPath.endsWith("client.html")) {
    const stats = getAssetStats(chartData);
    if (stats.assetCount === 0) {
      failures.push(`${reportPath}: no assets found`);
      continue;
    }

    if (stats.assetCount > clientBudgets.maxTotalAssets) {
      failures.push(
        `${reportPath}: total assetCount ${stats.assetCount} exceeds budget ${clientBudgets.maxTotalAssets}`
      );
    }
    if ((stats.worstParsed?.parsed || 0) > clientBudgets.maxEntrypointParsed) {
      failures.push(
        `${reportPath}: ${stats.worstParsed.entrypoint} parsed ${stats.worstParsed.parsed} exceeds per-entrypoint budget ${clientBudgets.maxEntrypointParsed}`
      );
    }
    if ((stats.worstGzip?.gzip || 0) > clientBudgets.maxEntrypointGzip) {
      failures.push(
        `${reportPath}: ${stats.worstGzip.entrypoint} gzip ${stats.worstGzip.gzip} exceeds per-entrypoint budget ${clientBudgets.maxEntrypointGzip}`
      );
    }
    if ((stats.worstAssetCount?.assetCount || 0) > clientBudgets.maxEntrypointAssets) {
      failures.push(
        `${reportPath}: ${stats.worstAssetCount.entrypoint} loads ${stats.worstAssetCount.assetCount} assets, exceeding per-entrypoint budget ${clientBudgets.maxEntrypointAssets}`
      );
    }
    if (stats.maxAssetParsed > clientBudgets.maxAssetParsed) {
      failures.push(
        `${reportPath}: maxAssetParsed ${stats.maxAssetParsed} exceeds budget ${clientBudgets.maxAssetParsed}`
      );
    }
    if (stats.maxAssetGzip > clientBudgets.maxAssetGzip) {
      failures.push(
        `${reportPath}: maxAssetGzip ${stats.maxAssetGzip} exceeds budget ${clientBudgets.maxAssetGzip}`
      );
    }

    console.log("[bundle-budget] client stats", {
      assetCount: stats.assetCount,
      worstParsed: stats.worstParsed,
      worstGzip: stats.worstGzip,
      worstAssetCount: stats.worstAssetCount,
      maxAssetParsed: stats.maxAssetParsed,
      maxAssetGzip: stats.maxAssetGzip,
    });
  }
}

if (failures.length > 0) {
  console.error("[bundle-budget] FAILED");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("[bundle-budget] PASSED");
