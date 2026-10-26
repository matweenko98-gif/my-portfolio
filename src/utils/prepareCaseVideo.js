// Encode locally: originals and audio never reach Storage.
export async function prepareCaseVideo(file, onProgress = () => {}) {
  if (!/\.mp4$/i.test(file.name) || file.size > 200 * 1024 * 1024) {
    throw new Error('Выберите MP4 до 200 МБ.');
  }
  const mimeType = ['video/mp4;codecs=avc1.42001E', 'video/mp4'].find(
    type => typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(type)
  );
  if (!mimeType) throw new Error('Для подготовки MP4 откройте админку в актуальном Chrome или Edge.');
  const url = URL.createObjectURL(file);
  const video = document.createElement('video');
  video.muted = true;
  video.playsInline = true;
  video.src = url;
  let stream, recorder, timer;
  try {
    await new Promise((resolve, reject) => {
      timer = setTimeout(() => reject(new Error('Не удалось прочитать видео за 20 секунд. Попробуйте другой MP4.')), 20000);
      video.onloadeddata = resolve;
      video.onerror = () => reject(new Error('Не удалось прочитать MP4. Используйте видео H.264.'));
    });
    clearTimeout(timer);
    if (!Number.isFinite(video.duration) || video.duration <= 0 || video.duration > 120 || !video.videoWidth || !video.videoHeight) {
      throw new Error('Видео должно длиться до 2 минут и иметь корректные размеры.');
    }
    const scale = Math.min(1, 1440 / Math.max(video.videoWidth, video.videoHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(2, Math.round(video.videoWidth * scale / 2) * 2);
    canvas.height = Math.max(2, Math.round(video.videoHeight * scale / 2) * 2);
    const context = canvas.getContext('2d', { alpha: false });
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    stream = canvas.captureStream(24);
    recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 1800000 });
    const chunks = [];
    const encoded = new Promise((resolve, reject) => {
      recorder.ondataavailable = event => { if (event.data.size) chunks.push(event.data); };
      recorder.onstop = () => resolve(new Blob(chunks, { type: 'video/mp4' }));
      recorder.onerror = () => reject(new Error('Ошибка сжатия видео. Попробуйте другой MP4.'));
    });
    // Attach a handler immediately, including when playback fails before awaiting encoding.
    encoded.catch(() => {});
    const playback = new Promise((resolve, reject) => {
      video.onended = resolve;
      video.onerror = () => reject(new Error('Не удалось обработать видео.'));
      timer = setTimeout(() => reject(new Error('Обработка прервана. Держите вкладку открытой и повторите загрузку.')), (video.duration + 45) * 1000);
    });
    recorder.start(1000);
    await video.play();
    const draw = setInterval(() => {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      onProgress(Math.min(99, Math.round(video.currentTime / video.duration * 100)));
    }, 1000 / 24);
    try { await playback; } finally { clearInterval(draw); }
    recorder.stop();
    const blob = await encoded;
    if (!blob.size || blob.size > 25 * 1024 * 1024) throw new Error('Результат превышает 25 МБ. Сократите видео и повторите загрузку.');
    return { blob, width: canvas.width, height: canvas.height };
  } finally {
    clearTimeout(timer);
    video.pause();
    if (recorder && recorder.state !== 'inactive') recorder.stop();
    stream?.getTracks().forEach(track => track.stop());
    video.removeAttribute('src');
    video.load();
    URL.revokeObjectURL(url);
  }
}
