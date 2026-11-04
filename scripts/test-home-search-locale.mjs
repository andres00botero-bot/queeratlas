import assert from 'node:assert/strict';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
const root = process.cwd().replaceAll('\\', '/') + '/';
const { fetchHomeSearch } = await import(pathToFileURL(root + 'src/lib/homeSearch.js'));
let source = fs.readFileSync(root + 'src/proxy.js', 'utf8');
source = source.replaceAll('"next/server"', JSON.stringify(pathToFileURL(root + 'node_modules/next/server.js').href));
source = source.replace(/"@\/([^"\n]+)"/g, (_, path) => JSON.stringify(pathToFileURL(root + 'src/' + path + '.js').href));
const { proxy } = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
const { NextRequest } = await import(pathToFileURL(root + 'node_modules/next/server.js'));
for (const locale of ['en', 'de', 'fr', 'es']) {
  for (const path of ['/api/home-data','/api/search?q=Berlin','/api/cron/calendar-reminders','/_next/static/chunks/app.js','/_next/image?url=x','/manifest.webmanifest','/sw.js','/icons/qa-logo-192.png','/robots.txt','/sitemap.xml','/monitoring']) {
    const result = proxy(new NextRequest('https://www.queeratlas.app' + path, { headers: { cookie: `qa_locale=${locale}; qa_locale_preference=manual` } }));
    assert.equal(result.headers.get('location'), null, `${locale}: ${path} must not redirect`);
    assert.equal(result.headers.get('x-middleware-rewrite'), null);
    assert.equal(result.headers.get('set-cookie'), null);
  }
}
const german = proxy(new NextRequest('https://www.queeratlas.app/berlin?tab=events', { headers: { cookie:'qa_locale=de; qa_locale_preference=manual' } }));
assert.equal(german.headers.get('location'), 'https://www.queeratlas.app/de/berlin?tab=events');
const localized = proxy(new NextRequest('https://www.queeratlas.app/fr/berlin'));
assert.equal(localized.headers.get('x-middleware-rewrite'), 'https://www.queeratlas.app/berlin');
assert.equal(localized.headers.get('x-middleware-request-x-qa-locale'), 'fr');
const controller = new AbortController();
const rows = Array.from({length:20}, (_, id) => ({id, type: id === 0 ? 'guide' : 'place', name:'Venue', city:'Berlin'}));
const found = await fetchHomeSearch('  Berlin  ', { signal: controller.signal, timeZone:'Europe/Stockholm', fetcher: async (url, options) => {
  const parsed = new URL(url, 'https://www.queeratlas.app');
  assert.equal(parsed.pathname, '/api/search');
  assert.equal(parsed.searchParams.get('mode'), 'suggestions');
  assert.equal(parsed.searchParams.get('q'), 'Berlin');
  assert.equal(parsed.searchParams.get('tz'), 'Europe/Stockholm');
  assert.equal(options.signal, controller.signal);
  return {ok:true,json:async()=>({results:{all:rows},meta:{partialData:true}})};
}});
assert.equal(found.results.length,12);
assert.equal(found.results[0].id,1);
assert.equal(found.partialData,true);
assert.deepEqual(await fetchHomeSearch('none', {fetcher:async()=>({ok:true,json:async()=>({results:{all:[]}})})}), {results:[],partialData:false});
await assert.rejects(fetchHomeSearch('Berlin', {fetcher:async()=>({ok:false})}), /unavailable/);
await assert.rejects(fetchHomeSearch('Berlin', {fetcher:async()=>({ok:true,json:async()=>({})})}), /Invalid/);
controller.abort();
await assert.rejects(fetchHomeSearch('Berlin', {signal:controller.signal,fetcher:async(_,options)=>{options.signal.throwIfAborted();}}), {name:'AbortError'});
console.log('Locale routing: 44 resource checks and page routing passed. Homepage search: bounded results, parameters, partial/empty/error responses and cancellation passed.');
