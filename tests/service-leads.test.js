import test from 'node:test';
import assert from 'node:assert/strict';
import { chooseServiceProjects, serviceLeadOptions } from '../src/utils/serviceLeads.js';
test('portfolio prioritizes the service and excludes concepts and unfinished projects', () => {
 const make=(title,extra={})=>({title,slug:title,card_image:'/image.webp',...extra});
 const items=[make('Сайт компании'),make('Интернет-магазин'),make('Лендинг'),make('Интернет-магазин концепт',{is_ai_concept:true}),make('Магазин в работе',{is_in_development:true})];
 assert.deepEqual(chooseServiceProjects(items,'online-store').map(x=>x.title),['Интернет-магазин']);
 assert.deepEqual(chooseServiceProjects(items,'multipage').map(x=>x.title),['Сайт компании']);
 assert.deepEqual(chooseServiceProjects(items,'landing').map(x=>x.title),['Лендинг']);
 assert.equal(serviceLeadOptions['online-store'].price,45000);
 assert.equal(serviceLeadOptions.multipage.price,45000);
 assert.notDeepEqual(serviceLeadOptions['online-store'].choices,serviceLeadOptions.multipage.choices);
});
