import React from 'react';
import { renderToPipeableStream } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { PassThrough } from 'node:stream';
import HomePage from './components/HomePage';
import LegalPage from './components/LegalPage';
import BriefPage from './components/BriefPage';

export async function render(path) {
  const page = path === '/' ? <HomePage /> : path === '/brief' ? <BriefPage /> :
    <LegalPage type={path === '/privacy-policy' ? 'privacy' : 'terms'} />;
  return new Promise((resolve, reject) => {
    const output = new PassThrough();
    let html = '';
    output.on('data', chunk => { html += chunk.toString(); });
    output.on('end', () => resolve(html));
    output.on('error', reject);
    const stream = renderToPipeableStream(
      <MemoryRouter initialEntries={[path]}>{page}</MemoryRouter>,
      { onAllReady() { stream.pipe(output); }, onError: reject },
    );
  });
}
