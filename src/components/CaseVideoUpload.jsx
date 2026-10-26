import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { prepareCaseVideo } from '../utils/prepareCaseVideo';

export default function CaseVideoUpload({ value, onChange, busy, onBusy, onError }) {
  const [progress, setProgress] = useState(0);
  async function upload(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    onBusy(true);
    setProgress(0);
    try {
      const { blob, width, height } = await prepareCaseVideo(file, setProgress);
      setProgress(100);
      const path = `uploads/video-${crypto.randomUUID()}.mp4`;
      const { error } = await supabase.storage.from('case-images').upload(path, blob, {
        contentType: 'video/mp4', cacheControl: '31536000', upsert: false,
      });
      if (error) throw new Error(`Хранилище не приняло MP4: ${error.message}`);
      const { data } = supabase.storage.from('case-images').getPublicUrl(path);
      onChange({ url: data.publicUrl, width, height });
    } catch (error) { onError(error.message); }
    finally { onBusy(false); }
  }
  return <div className="space-y-3 border-t border-zinc-200 pt-5">
    <p className="text-xs font-semibold uppercase tracking-wider">Видео вместо обложки (необязательно)</p>
    <p className="text-xs text-zinc-500">MP4 до 2 минут и 200 МБ. Автоматически: до 1440 px, 24 кадра/с, без звука, до 25 МБ после сжатия. Подготовка занимает примерно длительность ролика — держите вкладку открытой. На сайте видео автоматически воспроизводится без звука по кругу, пока видно на экране; обложка используется как постер.</p>
    {value?.url && <>
      <video src={value.url} controls muted playsInline preload="metadata" className="max-w-full max-h-64" />
      <button type="button" disabled={busy} onClick={() => onChange(null)} className="text-xs text-red-600">Убрать видео и показывать обложку</button>
    </>}
    <label className="block text-sm">
      {busy ? (progress === 100 ? 'Загрузка в хранилище…' : `Подготовка MP4: ${progress}%`) : 'Загрузить MP4'}
      <input type="file" accept="video/mp4,.mp4" disabled={busy} onChange={upload} className="block mt-2 text-xs max-w-full" />
    </label>
  </div>;
}
