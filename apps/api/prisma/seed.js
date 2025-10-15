import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// Raw TSV (tab-separated) dataset embedded for initial seeding. In production, prefer a CSV/TSV file under version control or object storage.
const rawData = `Stockyard Name\tWarehouse Location\tLatitude\tLongitude\tLoading Point Name\tMaterial (सामग्री)\tCapacity (tons)\tLoading Cost per ton (INR)\tDemurrage Cost per day (INR)\tInventory Holding Cost per ton per day (INR)\tProduct ID\tPreferred Wagon Type\tAverage Wagon Capacity (tons)
Bokaro\tBokaro Warehouse\t23.669296\t86.151115\tLP-BOK-1\tElectrical Steels\t1914\t47\t2177\t4\tP001\tBCN\t58
Bokaro\tBokaro Warehouse\t23.669296\t86.151115\tLP-BOK-2\tSAIL TMT BARS\t2352\t49\t2302\t5\tP002\tBCN\t58
Bokaro\tBokaro Warehouse\t23.669296\t86.151115\tLP-BOK-3\tStructurals\t3016\t51\t2215\t6\tP003\tBCN\t58
Bokaro\tBokaro Warehouse\t23.669296\t86.151115\tLP-BOK-1\tStainless Steel Products\t3347\t57\t2519\t7\tP004\tBCN\t58
Bokaro\tBokaro Warehouse\t23.669296\t86.151115\tLP-BOK-2\tPlates\t4058\t57\t2887\t4\tP005\tBCN\t58
Bokaro\tBokaro Warehouse\t23.669296\t86.151115\tLP-BOK-3\tWire Rods\t4401\t66\t2912\t5\tP006\tBCN\t58
Bhilai\tBhilai Warehouse\t21.185157\t81.394207\tLP-BHI-1\tHot Rolled Products\t1974\t49\t1879\t4\tP007\tBCN\t58
Bhilai\tBhilai Warehouse\t21.185157\t81.394207\tLP-BHI-2\tPipes\t2410\t53\t2052\t5\tP008\tBCN\t58
Bhilai\tBhilai Warehouse\t21.185157\t81.394207\tLP-BHI-3\tPlates\t2847\t57\t2249\t6\tP005\tBCN\t58
Bhilai\tBhilai Warehouse\t21.185157\t81.394207\tLP-BHI-1\tStructurals\t3483\t59\t2709\t7\tP003\tBCN\t58
Bhilai\tBhilai Warehouse\t21.185157\t81.394207\tLP-BHI-2\tGalvanised Products\t3935\t57\t2973\t4\tP009\tBCN\t58
Bhilai\tBhilai Warehouse\t21.185157\t81.394207\tLP-BHI-3\tWheels and Axles\t4535\t61\t3298\t5\tP010\tBCN\t58
Durgapur\tDurgapur Warehouse\t23.54843\t87.245247\tLP-DUR-1\tSAIL SeQR TMT Bars\t2253\t50\t2095\t4\tP011\tBCN\t58
Durgapur\tDurgapur Warehouse\t23.54843\t87.245247\tLP-DUR-2\tWheels and Axles\t2398\t49\t2023\t5\tP010\tBCN\t58
Durgapur\tDurgapur Warehouse\t23.54843\t87.245247\tLP-DUR-3\tSAIL TMT BARS\t3138\t54\t2595\t6\tP002\tBCN\t58
Durgapur\tDurgapur Warehouse\t23.54843\t87.245247\tLP-DUR-1\tCold Rolled Products\t3448\t55\t2837\t7\tP012\tBCN\t58
Durgapur\tDurgapur Warehouse\t23.54843\t87.245247\tLP-DUR-2\tPlates\t3919\t58\t2794\t4\tP005\tBCN\t58
Durgapur\tDurgapur Warehouse\t23.54843\t87.245247\tLP-DUR-3\tPipes\t4442\t67\t3125\t5\tP008\tBCN\t58
Rourkela\tRourkela Warehouse\t22.210804\t84.86895\tLP-ROU-1\tPig Iron\t2143\t49\t2159\t4\tP013\tBOXN\t61
Rourkela\tRourkela Warehouse\t22.210804\t84.86895\tLP-ROU-2\tRailway Products\t2779\t49\t2311\t5\tP014\tBOXN\t61
Rourkela\tRourkela Warehouse\t22.210804\t84.86895\tLP-ROU-3\tGalvanised Products\t3125\t53\t2473\t6\tP009\tBCN\t58
Rourkela\tRourkela Warehouse\t22.210804\t84.86895\tLP-ROU-1\tSAIL SeQR TMT Bars\t3673\t57\t2483\t7\tP011\tBCN\t58
Rourkela\tRourkela Warehouse\t22.210804\t84.86895\tLP-ROU-2\tStainless Steel Products\t4036\t63\t2738\t4\tP004\tBCN\t58
Rourkela\tRourkela Warehouse\t22.210804\t84.86895\tLP-ROU-3\tWire Rods\t4773\t63\t3150\t5\tP006\tBCN\t58
IISCO\tBurnpur Warehouse\t23.673236\t86.926179\tLP-IIS-1\tRailway Products\t2212\t50\t2005\t4\tP014\tBOXN\t61
IISCO\tBurnpur Warehouse\t23.673236\t86.926179\tLP-IIS-2\tPig Iron\t2437\t49\t2108\t5\tP013\tBOXN\t61
IISCO\tBurnpur Warehouse\t23.673236\t86.926179\tLP-IIS-3\tSemis\t3267\t56\t2308\t6\tP015\tBOXN\t61
IISCO\tBurnpur Warehouse\t23.673236\t86.926179\tLP-IIS-1\tStructurals\t3635\t61\t2602\t7\tP003\tBCN\t58
IISCO\tBurnpur Warehouse\t23.673236\t86.926179\tLP-IIS-2\tWire Rods\t4252\t64\t2673\t4\tP006\tBCN\t58
IISCO\tBurnpur Warehouse\t23.673236\t86.926179\tLP-IIS-3\tStainless Steel Products\t4435\t62\t2926\t5\tP004\tBCN\t58
Salem\tSalem Warehouse\t11.65511\t78.03196\tLP-SAL-1\tStainless Steel Products\t2259\t51\t1985\t4\tP004\tBCN\t58
Salem\tSalem Warehouse\t11.65511\t78.03196\tLP-SAL-2\tCold Rolled Products\t2412\t50\t2260\t5\tP012\tBCN\t58
Salem\tSalem Warehouse\t11.65511\t78.03196\tLP-SAL-3\tPig Iron\t3052\t52\t2586\t6\tP013\tBOXN\t61
Salem\tSalem Warehouse\t11.65511\t78.03196\tLP-SAL-1\tPlates\t3324\t55\t2478\t7\tP005\tBCN\t58
Salem\tSalem Warehouse\t11.65511\t78.03196\tLP-SAL-2\tPipes\t4121\t59\t3005\t4\tP008\tBCN\t58
Salem\tSalem Warehouse\t11.65511\t78.03196\tLP-SAL-3\tWheels and Axles\t4648\t66\t3105\t5\tP010\tBCN\t58
Visakhapatnam\tVizag Warehouse\t17.686815\t83.218483\tLP-VIS-1\tSAIL TMT BARS\t1928\t45\t2148\t4\tP002\tBCN\t58
Visakhapatnam\tVizag Warehouse\t17.686815\t83.218483\tLP-VIS-2\tWheels and Axles\t2669\t49\t2349\t5\tP010\tBCN\t58
Visakhapatnam\tVizag Warehouse\t17.686815\t83.218483\tLP-VIS-3\tPig Iron\t3253\t55\t2593\t6\tP013\tBOXN\t61
Visakhapatnam\tVizag Warehouse\t17.686815\t83.218483\tLP-VIS-1\tPipes\t3628\t59\t2457\t7\tP008\tBCN\t58
Visakhapatnam\tVizag Warehouse\t17.686815\t83.218483\tLP-VIS-2\tHot Rolled Products\t3950\t63\t2680\t4\tP007\tBCN\t58
Visakhapatnam\tVizag Warehouse\t17.686815\t83.218483\tLP-VIS-3\tCold Rolled Products\t4532\t60\t3288\t5\tP012\tBCN\t58
Chennai\tChennai Warehouse\t13.063977\t80.144986\tLP-CHE-1\tStainless Steel Products\t2267\t46\t2245\t4\tP004\tBCN\t58
Chennai\tChennai Warehouse\t13.063977\t80.144986\tLP-CHE-2\tSAIL SeQR TMT Bars\t2620\t52\t2430\t5\tP011\tBCN\t58
Chennai\tChennai Warehouse\t13.063977\t80.144986\tLP-CHE-3\tPlates\t3127\t54\t2278\t6\tP005\tBCN\t58
Chennai\tChennai Warehouse\t13.063977\t80.144986\tLP-CHE-1\tCold Rolled Products\t3491\t56\t2676\t7\tP012\tBCN\t58
Chennai\tChennai Warehouse\t13.063977\t80.144986\tLP-CHE-2\tGalvanised Products\t4288\t57\t2906\t4\tP009\tBCN\t58
Chennai\tChennai Warehouse\t13.063977\t80.144986\tLP-CHE-3\tPig Iron\t4465\t67\t2809\t5\tP013\tBOXN\t61
Delhi\tTughlakabad Warehouse\t28.5034421\t77.2970508\tLP-DEL-1\tSAIL TMT BARS\t1923\t46\t1843\t4\tP002\tBCN\t58
Delhi\tTughlakabad Warehouse\t28.5034421\t77.2970508\tLP-DEL-2\tRailway Products\t2674\t55\t2417\t5\tP014\tBOXN\t61
Delhi\tTughlakabad Warehouse\t28.5034421\t77.2970508\tLP-DEL-3\tSemis\t2835\t53\t2265\t6\tP015\tBOXN\t61
Delhi\tTughlakabad Warehouse\t28.5034421\t77.2970508\tLP-DEL-1\tPlates\t3637\t61\t2884\t7\tP005\tBCN\t58
Delhi\tTughlakabad Warehouse\t28.5034421\t77.2970508\tLP-DEL-2\tWire Rods\t4081\t59\t2735\t4\tP006\tBCN\t58
Delhi\tTughlakabad Warehouse\t28.5034421\t77.2970508\tLP-DEL-3\tStructurals\t4570\t66\t3293\t5\tP003\tBCN\t58
Kolkata\tDankuni Warehouse\t22.671679\t88.300209\tLP-KOL-1\tWire Rods\t2004\t50\t2024\t4\tP006\tBCN\t58
Kolkata\tDankuni Warehouse\t22.671679\t88.300209\tLP-KOL-2\tCold Rolled Products\t2760\t55\t2061\t5\tP012\tBCN\t58
Kolkata\tDankuni Warehouse\t22.671679\t88.300209\tLP-KOL-3\tSemis\t2926\t54\t2232\t6\tP015\tBOXN\t61
Kolkata\tDankuni Warehouse\t22.671679\t88.300209\tLP-KOL-1\tStainless Steel Products\t3473\t54\t2701\t7\tP004\tBCN\t58
Kolkata\tDankuni Warehouse\t22.671679\t88.300209\tLP-KOL-2\tSAIL SeQR TMT Bars\t4083\t60\t2901\t4\tP011\tBCN\t58
Kolkata\tDankuni Warehouse\t22.671679\t88.300209\tLP-KOL-3\tPlates\t4412\t60\t2836\t5\tP005\tBCN\t58
Patna\tFatuha Warehouse\t25.508702\t85.306393\tLP-PAT-1\tStainless Steel Products\t2240\t50\t1836\t4\tP004\tBCN\t58
Patna\tFatuha Warehouse\t25.508702\t85.306393\tLP-PAT-2\tElectrical Steels\t2563\t51\t2142\t5\tP001\tBCN\t58
Patna\tFatuha Warehouse\t25.508702\t85.306393\tLP-PAT-3\tStructurals\t3142\t58\t2309\t6\tP003\tBCN\t58
Patna\tFatuha Warehouse\t25.508702\t85.306393\tLP-PAT-1\tWire Rods\t3576\t56\t2770\t7\tP006\tBCN\t58
Patna\tFatuha Warehouse\t25.508702\t85.306393\tLP-PAT-2\tSAIL TMT BARS\t4278\t64\t2724\t4\tP002\tBCN\t58
Patna\tFatuha Warehouse\t25.508702\t85.306393\tLP-PAT-3\tSemis\t4701\t67\t3213\t5\tP015\tBOXN\t61
Mumbai\tKalamboli Warehouse\t19.02577\t73.10157\tLP-MUM-1\tWheels and Axles\t1981\t51\t2010\t4\tP010\tBCN\t58
Mumbai\tKalamboli Warehouse\t19.02577\t73.10157\tLP-MUM-2\tWire Rods\t2539\t48\t2344\t5\tP006\tBCN\t58
Mumbai\tKalamboli Warehouse\t19.02577\t73.10157\tLP-MUM-3\tSAIL TMT BARS\t3134\t52\t2231\t6\tP002\tBCN\t58
Mumbai\tKalamboli Warehouse\t19.02577\t73.10157\tLP-MUM-1\tSemis\t3506\t59\t2809\t7\tP015\tBOXN\t61
Mumbai\tKalamboli Warehouse\t19.02577\t73.10157\tLP-MUM-2\tElectrical Steels\t4241\t58\t2727\t4\tP001\tBCN\t58
Mumbai\tKalamboli Warehouse\t19.02577\t73.10157\tLP-MUM-3\tSAIL SeQR TMT Bars\t4398\t63\t3074\t5\tP011\tBCN\t58
Vijayawada\tVijayawada Warehouse\t16.515099\t80.632095\tLP-VIJ-1\tHot Rolled Products\t1927\t46\t2026\t4\tP007\tBCN\t58
Vijayawada\tVijayawada Warehouse\t16.515099\t80.632095\tLP-VIJ-2\tGalvanised Products\t2713\t49\t2025\t5\tP009\tBCN\t58
Vijayawada\tVijayawada Warehouse\t16.515099\t80.632095\tLP-VIJ-3\tWheels and Axles\t3133\t51\t2696\t6\tP010\tBCN\t58
Vijayawada\tVijayawada Warehouse\t16.515099\t80.632095\tLP-VIJ-1\tPig Iron\t3347\t57\t2485\t7\tP013\tBOXN\t61
Vijayawada\tVijayawada Warehouse\t16.515099\t80.632095\tLP-VIJ-2\tPlates\t4008\t64\t2846\t4\tP005\tBCN\t58
Vijayawada\tVijayawada Warehouse\t16.515099\t80.632095\tLP-VIJ-3\tSAIL SeQR TMT Bars\t4409\t66\t3262\t5\tP011\tBCN\t58
Kanpur\tPanki Warehouse\t26.471282\t80.249001\tLP-KAN-1\tStructurals\t2274\t52\t1946\t4\tP003\tBCN\t58
Kanpur\tPanki Warehouse\t26.471282\t80.249001\tLP-KAN-2\tGalvanised Products\t2516\t55\t2079\t5\tP009\tBCN\t58
Kanpur\tPanki Warehouse\t26.471282\t80.249001\tLP-KAN-3\tWheels and Axles\t2897\t55\t2311\t6\tP010\tBCN\t58
Kanpur\tPanki Warehouse\t26.471282\t80.249001\tLP-KAN-1\tSAIL SeQR TMT Bars\t3795\t54\t2696\t7\tP011\tBCN\t58
Kanpur\tPanki Warehouse\t26.471282\t80.249001\tLP-KAN-2\tSemis\t4176\t57\t2982\t4\tP015\tBOXN\t61
Kanpur\tPanki Warehouse\t26.471282\t80.249001\tLP-KAN-3\tPlates\t4460\t60\t2825\t5\tP005\tBCN\t58
Prayagraj\tNaini Warehouse\t25.379194\t81.877068\tLP-PRA-1\tPipes\t2291\t46\t2235\t4\tP008\tBCN\t58
Prayagraj\tNaini Warehouse\t25.379194\t81.877068\tLP-PRA-2\tHot Rolled Products\t2395\t49\t2304\t5\tP007\tBCN\t58
Prayagraj\tNaini Warehouse\t25.379194\t81.877068\tLP-PRA-3\tCold Rolled Products\t2834\t54\t2406\t6\tP012\tBCN\t58
Prayagraj\tNaini Warehouse\t25.379194\t81.877068\tLP-PRA-1\tSemis\t3361\t57\t2696\t7\tP015\tBOXN\t61
Prayagraj\tNaini Warehouse\t25.379194\t81.877068\tLP-PRA-2\tGalvanised Products\t4104\t57\t2917\t4\tP009\tBCN\t58
Prayagraj\tNaini Warehouse\t25.379194\t81.877068\tLP-PRA-3\tStructurals\t4341\t66\t3136\t5\tP003\tBCN\t58
Ghaziabad\tGhaziabad Warehouse\t28.667856\t77.449791\tLP-GHA-1\tPipes\t2142\t50\t1922\t4\tP008\tBCN\t58
Ghaziabad\tGhaziabad Warehouse\t28.667856\t77.449791\tLP-GHA-2\tSAIL SeQR TMT Bars\t2435\t54\t2067\t5\tP011\tBCN\t58
Ghaziabad\tGhaziabad Warehouse\t28.667856\t77.449791\tLP-GHA-3\tCold Rolled Products\t3143\t55\t2434\t6\tP012\tBCN\t58
Ghaziabad\tGhaziabad Warehouse\t28.667856\t77.449791\tLP-GHA-1\tRailway Products\t3461\t55\t2404\t7\tP014\tBOXN\t61
Ghaziabad\tGhaziabad Warehouse\t28.667856\t77.449791\tLP-GHA-2\tPlates\t4034\t58\t2637\t4\tP005\tBCN\t58
Ghaziabad\tGhaziabad Warehouse\t28.667856\t77.449791\tLP-GHA-3\tWire Rods\t4575\t63\t3059\t5\tP006\tBCN\t58
Faridabad\tFaridabad Warehouse\t28.402837\t77.3085626\tLP-FAR-1\tPlates\t1945\t47\t2024\t4\tP005\tBCN\t58
Faridabad\tFaridabad Warehouse\t28.402837\t77.3085626\tLP-FAR-2\tGalvanised Products\t2726\t52\t2313\t5\tP009\tBCN\t58
Faridabad\tFaridabad Warehouse\t28.402837\t77.3085626\tLP-FAR-3\tRailway Products\t3213\t51\t2541\t6\tP014\tBOXN\t61
Faridabad\tFaridabad Warehouse\t28.402837\t77.3085626\tLP-FAR-1\tSAIL TMT BARS\t3718\t58\t2877\t7\tP002\tBCN\t58
Faridabad\tFaridabad Warehouse\t28.402837\t77.3085626\tLP-FAR-2\tWire Rods\t4139\t58\t3080\t4\tP006\tBCN\t58
Faridabad\tFaridabad Warehouse\t28.402837\t77.3085626\tLP-FAR-3\tSemis\t4749\t62\t2935\t5\tP015\tBOXN\t61
Jamshedpur\tJamshedpur Warehouse\t22.7925\t86.18417\tLP-JAM-1\tSAIL TMT BARS\t1944\t48\t2167\t4\tP002\tBCN\t58
Jamshedpur\tJamshedpur Warehouse\t22.7925\t86.18417\tLP-JAM-2\tSAIL SeQR TMT Bars\t2475\t51\t2351\t5\tP011\tBCN\t58
Jamshedpur\tJamshedpur Warehouse\t22.7925\t86.18417\tLP-JAM-3\tStainless Steel Products\t3124\t55\t2458\t6\tP004\tBCN\t58
Jamshedpur\tJamshedpur Warehouse\t22.7925\t86.18417\tLP-JAM-1\tCold Rolled Products\t3550\t58\t2863\t7\tP012\tBCN\t58
Jamshedpur\tJamshedpur Warehouse\t22.7925\t86.18417\tLP-JAM-2\tGalvanised Products\t4264\t57\t2647\t4\tP009\tBCN\t58
Jamshedpur\tJamshedpur Warehouse\t22.7925\t86.18417\tLP-JAM-3\tPlates\t4624\t66\t3224\t5\tP005\tBCN\t58`;

function parseTSV(tsv) {
  const lines = tsv.trim().split(/\r?\n/);
  const header = lines.shift();
  return lines.map(l => {
    const [stockyardName, warehouseLocation, lat, lng, loadingPointName, material, capacity, loadingCost, demurrage, holdingCost, productId, wagonType, wagonCap] = l.split(/\t/);
    return {
      stockyardName,
      warehouseLocation,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      loadingPointName,
      material,
      capacityTons: parseInt(capacity,10),
      loadingCostPerTonINR: parseInt(loadingCost,10),
      demurrageCostPerDayINR: parseInt(demurrage,10),
      holdingCostPerTonPerDay: parseInt(holdingCost,10),
      productId,
      preferredWagonType: wagonType,
      averageWagonCapacityTons: parseInt(wagonCap,10)
    };
  });
}

async function main() {
  // Ensure DB has aggregate columns for Stockyard even if migration wasn't applied
  try {
    await prisma.$executeRawUnsafe('ALTER TABLE "Stockyard" ADD COLUMN IF NOT EXISTS "materials" text[] NOT NULL DEFAULT \'{ }\'');
    await prisma.$executeRawUnsafe('ALTER TABLE "Stockyard" ALTER COLUMN "materials" SET DEFAULT \'{ }\'');
  } catch {}
  try {
    await prisma.$executeRawUnsafe('ALTER TABLE "Stockyard" ADD COLUMN IF NOT EXISTS "totalCapacityTons" integer');
  } catch {}
  const rows = parseTSV(rawData);
  const grouped = rows.reduce((acc, r) => {
    const key = r.stockyardName + '||' + r.warehouseLocation;
    if(!acc[key]) acc[key] = { stockyard: { name: r.stockyardName, warehouseLocation: r.warehouseLocation, lat: r.lat, lng: r.lng }, loadingPoints: [] };
    acc[key].loadingPoints.push(r);
    return acc;
  }, {});

  for (const key of Object.keys(grouped)) {
    const { stockyard, loadingPoints } = grouped[key];
    // Derive stockyard-level aggregates
    const materials = Array.from(new Set(loadingPoints.map(lp => lp.material)));
    const totalCapacityTons = loadingPoints.reduce((s, lp) => s + (lp.capacityTons || 0), 0);
    // Upsert stockyard
    const sy = await prisma.stockyard.upsert({
      where: { name_warehouseLocation: { name: stockyard.name, warehouseLocation: stockyard.warehouseLocation } },
      update: { lat: stockyard.lat, lng: stockyard.lng, materials, totalCapacityTons },
      create: { name: stockyard.name, warehouseLocation: stockyard.warehouseLocation, lat: stockyard.lat, lng: stockyard.lng, materials, totalCapacityTons }
    });

    for (const lp of loadingPoints) {
      await prisma.loadingPoint.upsert({
        where: { stockyardId_loadingPointName_material: { stockyardId: sy.id, loadingPointName: lp.loadingPointName, material: lp.material } },
        update: {
          capacityTons: lp.capacityTons,
          loadingCostPerTonINR: lp.loadingCostPerTonINR,
          demurrageCostPerDayINR: lp.demurrageCostPerDayINR,
          holdingCostPerTonPerDay: lp.holdingCostPerTonPerDay,
          productId: lp.productId,
          preferredWagonType: lp.preferredWagonType,
          averageWagonCapacityTons: lp.averageWagonCapacityTons
        },
        create: {
          loadingPointName: lp.loadingPointName,
          material: lp.material,
          capacityTons: lp.capacityTons,
          loadingCostPerTonINR: lp.loadingCostPerTonINR,
            demurrageCostPerDayINR: lp.demurrageCostPerDayINR,
          holdingCostPerTonPerDay: lp.holdingCostPerTonPerDay,
          productId: lp.productId,
          preferredWagonType: lp.preferredWagonType,
          averageWagonCapacityTons: lp.averageWagonCapacityTons,
          stockyardId: sy.id
        }
      });
    }
  }
  console.log('Primary dataset seeded');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
