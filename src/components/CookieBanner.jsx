import React, { useEffect, useState } from 'react';

export default function CookieBanner() {
  const [accepted, setAccepted] = useState(true);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('cookie_accepted');
      if (stored === 'true') {
        setAccepted(true);
        setVisible(false);
      } else {
        setAccepted(false);
        // show after small delay to avoid jank on load
        const t = setTimeout(() => setVisible(true), 800);
        return () => clearTimeout(t);
      }
    } catch (e) {
      setVisible(true);
    }
  }, []);

  const accept = () => {
    try {
      localStorage.setItem('cookie_accepted', 'true');
    } catch (e) {}
    setAccepted(true);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className={`fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md transition-transform duration-300 ${visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
      <div className="bg-white/95 border border-neutral-200 rounded-lg p-3.5 shadow-md backdrop-blur-sm text-sm text-neutral-900">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <div className="font-medium mb-1">Печеньки на базе</div>
            <div className="text-[13px] text-neutral-600">Использую файлы cookie, чтобы интерфейс летал, а аналитика радовалась. Вы не против?</div>
          </div>
          <div className="flex-shrink-0 ml-2">
            <button
              onClick={accept}
              className="inline-flex items-center justify-center px-3 py-1.5 bg-black text-white text-sm rounded-sm border border-transparent hover:opacity-95 transition"
            >Ок, супер</button>
          </div>
        </div>
      </div>
    </div>
  );
}
