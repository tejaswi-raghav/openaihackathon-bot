import fs from 'node:fs';
import { JSDOM } from 'jsdom';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const js = fs.readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const dom = new JSDOM(html, { url: 'https://rti-saathi.test/', runScripts: 'dangerously', pretendToBeVisual: true });
const { window } = dom;
window.HTMLElement.prototype.scrollIntoView = () => {};
window.eval(js);
const $ = (selector) => window.document.querySelector(selector);
const click = (selector) => $(selector).dispatchEvent(new window.MouseEvent('click', { bubbles: true }));

click('[data-action="start"]');
if ($('#requestModal').hidden) throw new Error('Request modal did not open');
$('[name="level"][value="state"]').checked = true;
click('#nextButton');
if ($('#stateNotice').hidden) throw new Error('State portal warning did not appear');
$('[name="level"][value="central"]').checked = true;
click('#nextButton');
if (!$('.form-step[data-step="1"]').hidden || $('.form-step[data-step="2"]').hidden) throw new Error('Step 2 navigation failed');
$('#topic').value = 'Education';
$('#authority').value = 'Ministry of Education';
click('#nextButton');
$('#question').value = 'Please provide the district-wise number of sanctioned teacher posts for 2024–25.';
$('#question').dispatchEvent(new window.Event('input', { bubbles: true }));
click('#promptButton');
if ($('#promptResult').hidden) throw new Error('Writing guidance did not appear');
click('#nextButton');
if ($('#reviewList').children.length !== 4) throw new Error('Review summary is incomplete');
$('.check-row input').checked = true;
$('#requestForm').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
if ($('#successState').hidden || !$('#demoReference').textContent.startsWith('RTI-DEMO-')) throw new Error('Demo completion failed');

$('#languageSelect').value = 'hi';
$('#languageSelect').dispatchEvent(new window.Event('change', { bubbles: true }));
if (!$('[data-i18n="heroLine1"]').textContent.includes('आपका')) throw new Error('Language switch failed');
click('#liteToggle');
if ($('#liteToggle').getAttribute('aria-pressed') !== 'true') throw new Error('Lite mode failed');

console.log('Smoke test passed: routing warning, four-step form, drafting guide, review, confirmation, language, and Lite mode.');
