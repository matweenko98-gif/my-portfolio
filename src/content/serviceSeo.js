import { MULTIPAGE_PATH, multipageService, multipageSchema } from './multipageService.js';
import { LANDING_PATH, landingService, landingSchema } from './landingService.js';
import { ONLINE_STORE_PATH, onlineStoreService, onlineStoreSchema } from './onlineStoreService.js';
import { additionalServices, additionalServiceSchema } from './additionalServices.js';

export const servicePages = {
 ...additionalServices,
 [MULTIPAGE_PATH]: {...multipageService, path:MULTIPAGE_PATH, slug:'multipage'},
 [LANDING_PATH]: {...landingService, path:LANDING_PATH, slug:'landing'},
 [ONLINE_STORE_PATH]: {...onlineStoreService, path:ONLINE_STORE_PATH, slug:'online-store'},
};
export const servicesUpdatedAt = '2026-10-31';
export function servicePageSchema(path) {
 const page=servicePages[path];
 if (!page) return null;
 const origin='https://www.ksenweb.com';
 const builders = {[MULTIPAGE_PATH]:multipageSchema,[LANDING_PATH]:landingSchema,[ONLINE_STORE_PATH]:onlineStoreSchema};
 const graph=(builders[path] ? builders[path]() : additionalServiceSchema(page))['@graph'];
 graph.push({'@type':'WebSite','@id':origin+'/#website',url:origin+'/',name:'KSENWEB',inLanguage:'ru'});
 if (page.faq?.length) graph.push({'@type':'FAQPage','@id':origin+path+'#faq',inLanguage:'ru',mainEntity:page.faq.map(([name,text])=>({'@type':'Question',name,acceptedAnswer:{'@type':'Answer',text}}))});
 return {'@context':'https://schema.org','@graph':graph};
}
