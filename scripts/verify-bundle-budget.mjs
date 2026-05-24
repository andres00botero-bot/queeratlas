import { readFileSync, existsSync } from "node:fs";

const reports = [
  ".next/analyze/client.html",
  ".next/analyze/nodejs.html",
  ".next/analyze/edge.html",
];

const clientBudgets = {
  maxAssets: 90,
  maxInitialParsed: 2_600_000,
  maxInitialGzip: 750_000,
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

function sum(values, key) {
  return values.reduce((total, item) => total + (Number(item?.[key]) || 0), 0);
}

function getAssetStats(chartData) {
  const assets = chartData.filter((item) => item && item.isAsset);
  const initialAssets = assets.filter(
    (item) => item.isInitialByEntrypoint && Object.keys(item.isInitialByEntrypoint).length > 0
  );

  return {
    assets,
    initialAssets,
    assetCount: assets.length,
    initialParsed: sum(initialAssets, "parsedSize"),
    initialGzip: sum(initialAssets, "gzipSize"),
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

    if (stats.assetCount > clientBudgets.maxAssets) {
      failures.push(
        `${reportPath}: assetCount ${stats.assetCount} exceeds budget ${clientBudgets.maxAssets}`
      );
    }
    if (stats.initialParsed > clientBudgets.maxInitialParsed) {
      failures.push(
        `${reportPath}: initialParsed ${stats.initialParsed} exceeds budget ${clientBudgets.maxInitialParsed}`
      );
    }
    if (stats.initialGzip > clientBudgets.maxInitialGzip) {
      failures.push(
        `${reportPath}: initialGzip ${stats.initialGzip} exceeds budget ${clientBudgets.maxInitialGzip}`
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
      initialParsed: stats.initialParsed,
      initialGzip: stats.initialGzip,
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
