const routes = ["/", "/cities", "/berlin", "/favorites"];

console.log("Performance baseline checklist");
console.log("");
console.log("1) Bundle analysis");
console.log("   Run: npm run analyze:bundle");
console.log("   Output: .next/analyze/client.html, .next/analyze/nodejs.html, .next/analyze/edge.html");
console.log("");
console.log("2) Route vitals capture");
console.log("   Run dev server and open browser console.");
console.log("   Filter console by: [web-vitals]");
console.log("   Visit these routes in order:");
routes.forEach((route, index) => {
  console.log(`   ${index + 1}. ${route}`);
});
console.log("");
console.log("3) Record these metrics per route");
console.log("   - LCP");
console.log("   - INP");
console.log("   - CLS");
console.log("   - TTFB");
console.log("   - FCP");
console.log("");
console.log("4) Pass criteria (initial target)");
console.log("   - No route with LCP/INP rated 'poor'");
console.log("   - CLS <= 0.1 on all measured routes");
