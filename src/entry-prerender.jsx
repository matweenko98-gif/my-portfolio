import React from 'react';
import { renderToPipeableStream } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { PassThrough } from 'node:stream';
import HomePage from './components/HomePage';
import SiteFooter from './components/SiteFooter';
import LegalPage from './components/LegalPage';
import BriefPage from './components/BriefPage';
import MultipageServicePage from './components/MultipageServicePage';
import { MULTIPAGE_PATH } from './content/multipageService';
import LandingServicePage from './components/LandingServicePage';
import { LANDING_PATH } from './content/landingService';
import OnlineStoreServicePage from './components/OnlineStoreServicePage';
import { ONLINE_STORE_PATH } from './content/onlineStoreService';

import AdditionalServicePage from './components/AdditionalServicePage';
import { additionalServices } from './content/additionalServices';

export async function render(path) {
  const page = additionalServices[path] ? <AdditionalServicePage service={additionalServices[path]}/> : path === ONLINE_STORE_PATH ? <OnlineStoreServicePage /> : path === LANDING_PATH ? <LandingServicePage /> : path === MULTIPAGE_PATH ? <MultipageServicePage /> : path === '/' ? <HomePage /> : path === '/brief' ? <BriefPage /> :
    <LegalPage type={path === '/privacy-policy' ? 'privacy' : 'terms'} />;
  return new Promise((resolve, reject) => {
    const output = new PassThrough();
    let html = '';
    output.on('data', chunk => { html += chunk.toString(); });
    output.on('end', () => resolve(html));
    output.on('error', reject);
    const stream = renderToPipeableStream(
      <MemoryRouter initialEntries={[path]}>{page}<SiteFooter/></MemoryRouter>,
      { onAllReady() { stream.pipe(output); }, onError: reject },
    );
  });
}
