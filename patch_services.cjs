const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'components', 'Services.jsx');
let content = fs.readFileSync(filePath, 'utf8');

const replacements = [
  // Service card wrapper: rounded-2xl -> rounded-md
  ['rounded-2xl p-6 sm:p-8 hover:border-zinc-200 transition-all bg-white shadow-sm duration-300', 'rounded-md p-6 sm:p-8 hover:border-zinc-200/40 transition-all bg-white duration-300'],

  // Bento right side details box
  ['"bg-zinc-50/50 border border-zinc-100 rounded-2xl p-5 h-full flex flex-col justify-center space-y-4"', '"bg-zinc-50/50 border border-zinc-100 rounded-md p-5 h-full flex flex-col justify-center space-y-4"'],

  // Calculator outer containers
  ['rounded-2xl p-5 sm:p-6 flex flex-col gap-6\\"', 'rounded-md p-5 sm:p-6 flex flex-col gap-6\\"'],

  // Option grids (bg-zinc-100 rounded-2xl border)
  ['bg-zinc-100 rounded-2xl border border-zinc-200/30', 'bg-zinc-100 rounded-md border border-zinc-200/30'],

  // Segmented control wrapper
  ['bg-zinc-100 rounded-xl border border-zinc-200/30', 'bg-zinc-100 rounded-md border border-zinc-200/30'],

  // Segmented control buttons
  ['sm:px-3 rounded-lg text-[11px] sm:text-xs font-semibold', 'sm:px-3 rounded-sm text-[11px] sm:text-xs font-semibold'],

  // Text area inputs
  ['focus:border-zinc-400 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-1 transition-all text-zinc-900 placeholder-zinc-400 resize-none', 'focus:border-zinc-400 rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-1 transition-all text-zinc-900 placeholder-zinc-400 resize-none'],

  // Name/contact text inputs
  ['w-full rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-1 transition-all text-zinc-900 placeholder-zinc-400', 'w-full rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-1 transition-all text-zinc-900 placeholder-zinc-400'],

  // Action buttons rounded-xl -> rounded-sm
  ['py-2.5 px-5 rounded-xl transition-all duration-200 hover:-translate-y-[0.5px] cursor-pointer', 'py-2.5 px-5 rounded-sm transition-all duration-200 hover:-translate-y-[0.5px] cursor-pointer'],

  // "Рассказать о задаче" button
  ['hover:bg-zinc-50 text-xs font-semibold py-2.5 px-5 rounded-xl transition-all duration-200 hover:-translate-y-[0.5px] cursor-pointer"', 'hover:bg-zinc-50 text-xs font-semibold py-2.5 px-5 rounded-sm transition-all duration-200 hover:-translate-y-[0.5px] cursor-pointer"'],

  // Tariff cards: rounded-2xl -> rounded-md
  ['rounded-2xl p-5 flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.01)] hover:shadow-md hover:border-zinc-300 transition-all duration-300', 'rounded-md p-4 flex flex-col justify-between hover:shadow-sm hover:border-zinc-300 transition-all duration-300'],

  // Checkbox label cards: rounded-xl -> rounded-sm  
  ['p-3.5 bg-white border border-zinc-200/40 rounded-xl hover:border-zinc-300 cursor-pointer transition-all shadow-sm', 'p-3.5 bg-white border border-zinc-200/40 rounded-sm hover:border-zinc-300 cursor-pointer transition-all'],

  // Cancel button in forms: rounded-lg -> rounded-sm
  ['text-sm font-semibold py-3 rounded-lg transition-all duration-200 text-center', 'text-sm font-semibold py-3 rounded-sm transition-all duration-200 text-center'],

  // Success modal: rounded-2xl -> rounded-md
  ['bg-white border border-zinc-100 rounded-2xl p-6 sm:p-8 max-w-[440px] w-full shadow-2xl relative flex flex-col items-center text-center gap-5', 'bg-white border border-zinc-100 rounded-md p-6 sm:p-8 max-w-[440px] w-full shadow-xl relative flex flex-col items-center text-center gap-5'],

  // Success modal inner card
  ['w-full bg-zinc-50 border border-zinc-100 rounded-2xl p-4 flex flex-col gap-3.5', 'w-full bg-zinc-50 border border-zinc-100 rounded-md p-4 flex flex-col gap-3.5'],

  // Success telegram button: rounded-xl -> rounded-sm
  ['bg-zinc-900 text-white font-semibold py-3 px-5 rounded-xl cursor-pointer w-full hover:bg-zinc-800 transition-all duration-200 hover:-translate-y-[0.5px] text-xs sm:text-sm', 'bg-zinc-900 text-white font-semibold py-3 px-5 rounded-sm cursor-pointer w-full hover:bg-zinc-800 transition-all duration-200 hover:-translate-y-[0.5px] text-xs sm:text-sm'],

  // ServiceCard icon bg: rounded-xl -> rounded-sm
  ['inline-flex items-center justify-center p-2.5 bg-zinc-50 rounded-xl border border-zinc-100/50 shrink-0', 'inline-flex items-center justify-center p-2.5 bg-zinc-50 rounded-sm border border-zinc-100/50 shrink-0'],

  // Consult telegram button: rounded-xl -> rounded-sm
  ['hover:-translate-y-[0.5px] cursor-pointer"', 'hover:-translate-y-[0.5px] cursor-pointer"'],

  // Consult send button
  ['py-3 px-8 rounded-xl transition-all duration-200 hover:-translate-y-[0.5px] cursor-pointer', 'py-3 px-8 rounded-sm transition-all duration-200 hover:-translate-y-[0.5px] cursor-pointer'],

  // Icon in success modal: rounded-2xl -> rounded-sm
  ['w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm', 'w-16 h-16 rounded-sm bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600'],

  // ServiceGraphic container: rounded-2xl -> rounded-md
  ['bg-gradient-to-br from-zinc-50 to-zinc-100/30 rounded-2xl border border-zinc-200/30 flex flex-col justify-between p-4 overflow-hidden select-none', 'bg-gradient-to-br from-zinc-50 to-zinc-100/30 rounded-md border border-zinc-200/20 flex flex-col justify-between p-4 overflow-hidden select-none'],
];

let count = 0;
for (const [from, to] of replacements) {
  if (content.includes(from)) {
    content = content.split(from).join(to);
    count++;
    console.log('Replaced:', from.slice(0, 60) + '...');
  } else {
    console.log('NOT FOUND:', from.slice(0, 60));
  }
}

fs.writeFileSync(filePath, content, 'utf8');
console.log(`\nDone: ${count} replacements applied.`);
