const fs = require('fs');
const path = require('path');

function patch(relPath, replacements) {
  const filePath = path.join(__dirname, relPath);
  let content = fs.readFileSync(filePath, 'utf8');
  let count = 0;
  for (const [from, to] of replacements) {
    if (content.includes(from)) {
      content = content.split(from).join(to);
      count++;
      console.log(`  ✓ ${relPath}: "${from.slice(0, 50)}..."`);
    }
  }
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`  → ${count} replacements in ${relPath}\n`);
}

// ── Workflow.jsx ──
patch('src/components/Workflow.jsx', [
  // Tab switcher wrapper
  ['bg-zinc-100/80 rounded-2xl border border-zinc-200/40 max-w-xl mb-12', 'bg-zinc-100/80 rounded-md border border-zinc-200/30 max-w-xl mb-12'],
  // Tab buttons active
  ['bg-zinc-900 text-white shadow-sm\'\n              : \'text-zinc-600 hover:text-zinc-900\'\n          }`}', 'bg-zinc-900 text-white\'\n              : \'text-zinc-600 hover:text-zinc-900\'\n          }`}'],
  // Step cards
  ['rounded-2xl p-6 flex flex-col justify-between transition-all duration-300', 'rounded-md p-6 flex flex-col justify-between transition-all duration-300'],
  // Result badge
  ['bg-zinc-50 border border-zinc-200/20 rounded-lg text-[10px]', 'bg-zinc-50 border border-zinc-200/20 rounded-sm text-[10px]'],
  // Standards cards
  ['rounded-2xl p-6 bg-white shadow-sm flex flex-col gap-4', 'rounded-md p-6 bg-white flex flex-col gap-4'],
  // Icon container in standards
  ['bg-zinc-50 border border-zinc-100/50 rounded-xl transition-all duration-500', 'bg-zinc-50 border border-zinc-100/50 rounded-sm transition-all duration-500'],
]);

// ── Reviews.jsx ──
patch('src/components/Reviews.jsx', [
  // Review scroll container
  ['rounded-2xl border border-zinc-100 bg-zinc-50/20 shadow-inner', 'rounded-md border border-zinc-100 bg-zinc-50/20'],
  // Individual review cards
  ['bg-white border border-zinc-200/40 rounded-2xl p-4 sm:p-5 shadow-[0_8px_30px_rgb(0,0,0,0.02)]', 'bg-white border border-zinc-200/30 rounded-md p-4 sm:p-5 shadow-[0_4px_20px_rgb(0,0,0,0.02)]'],
  // Image container in reviews
  ['rounded-xl border border-zinc-100 bg-zinc-50', 'rounded-sm border border-zinc-100 bg-zinc-50'],
  // Avatar circles keep rounded-full
]);

// ── Contacts.jsx ──
patch('src/components/Contacts.jsx', [
  // Intent buttons: rounded-xl -> rounded-sm
  ['text-[13px] font-medium rounded-xl border transition-all duration-200', 'text-[13px] font-medium rounded-sm border transition-all duration-200'],
  // Result card
  ['bg-gradient-to-b from-white to-zinc-50/80 border border-zinc-200/70 rounded-2xl p-5 sm:p-6 shadow-sm animate-fadeIn', 'bg-gradient-to-b from-white to-zinc-50/30 border border-zinc-200/40 rounded-md p-5 sm:p-6 animate-fadeIn'],
  // Timeline/price badges: rounded-lg -> rounded-sm
  ['text-zinc-700 bg-zinc-100 px-2.5 py-1 rounded-lg', 'text-zinc-700 bg-zinc-100 px-2.5 py-1 rounded-sm'],
  // Message text box
  ['bg-white border border-zinc-200 rounded-xl px-4 py-3', 'bg-white border border-zinc-200 rounded-sm px-4 py-3'],
  // Telegram button
  ['bg-zinc-900 text-white font-semibold py-3 px-5 rounded-xl hover:bg-zinc-800', 'bg-zinc-900 text-white font-semibold py-3 px-5 rounded-sm hover:bg-zinc-800'],
  // MAX button
  ['bg-[#5B4FE8] text-white font-semibold py-3 px-5 rounded-xl hover:bg-[#4a3fd6]', 'bg-[#5B4FE8] text-white font-semibold py-3 px-5 rounded-sm hover:bg-[#4a3fd6]'],
  // Calculator button: rounded-xl -> rounded-sm
  ['border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors', 'border border-zinc-200 rounded-sm hover:bg-zinc-50 transition-colors'],
]);

// ── ProjectCart.jsx ──
patch('src/components/ProjectCart.jsx', [
  // Cart container
  ['rounded-2xl border border-zinc-200/40 bg-zinc-50/80 shadow-inner', 'rounded-md border border-zinc-200/30 bg-zinc-50/80'],
  // Slot items
  ['min-h-[40px] rounded-xl border transition-all duration-300', 'min-h-[40px] rounded-sm border transition-all duration-300'],
  // Footer border
  ['border-t border-zinc-200/40 bg-white px-4 py-3.5 shrink-0', 'border-t border-zinc-200/30 bg-white px-4 py-3.5 shrink-0'],
  // Avatar badge in slots
  ['rounded-full bg-zinc-100 border border-zinc-200 flex items-center', 'rounded-sm bg-zinc-100 border border-zinc-200 flex items-center'],
]);

console.log('All patches applied successfully!');
