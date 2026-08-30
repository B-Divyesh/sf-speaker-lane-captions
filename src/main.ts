import './styles.css';
import { clearCaptions, loadCaptions, replaceCaptions, saveCaption } from './db';
import { captureReturnedLicense, optimisticUnlock, storeLicense, verifyLicense } from './license';
import { OnDeviceSpeech } from './speech';
import type { CaptionEntry, LaneId, Preferences } from './types';

const $ = <T extends HTMLElement>(selector: string) => document.querySelector<T>(selector)!;
let demoMode = isDemoUrl();
let databaseName = demoMode ? 'demo:caption-lanes' : 'caption-lanes';
let preferencesKey = demoMode ? 'demo:caption-lanes:preferences' : 'caption-lanes:preferences';
const laneOrder: LaneId[] = ['left', 'center', 'right', 'across'];
const laneMeta: Record<LaneId, { arrow: string; empty: string }> = {
  left: { arrow: '←', empty: 'Speech from your left will gather here.' },
  center: { arrow: '↑', empty: 'Speech from ahead will gather here.' },
  right: { arrow: '→', empty: 'Speech from your right will gather here.' },
  across: { arrow: '↗', empty: 'A fourth manually selected voice will gather here.' }
};
const palette = ['#73c8c3', '#f2b96b', '#e58f8b', '#a8c97f', '#c4a7e7'];
const defaultPreferences: Preferences = {
  captionSize: 24,
  hideUncertain: false,
  lanes: {
    left: { label: 'Left', color: '#73c8c3', locked: true },
    center: { label: 'Centre', color: '#f2b96b', locked: true },
    right: { label: 'Right', color: '#e58f8b', locked: true },
    across: { label: 'Across', color: '#a8c97f', locked: true }
  }
};
const demoCaptions: CaptionEntry[] = [
  { id: 'demo-1', lane: 'left', text: 'Should we move the chairs closer?', confidence: .88, createdAt: '2026-08-30T18:02:00.000Z', source: 'speech' },
  { id: 'demo-2', lane: 'center', text: 'This distance works well for me.', confidence: .91, createdAt: '2026-08-30T18:02:08.000Z', source: 'speech' },
  { id: 'demo-3', lane: 'right', text: 'I can turn down the music too.', confidence: .83, createdAt: '2026-08-30T18:02:17.000Z', source: 'speech' },
  { id: 'demo-4', lane: 'left', text: 'Yes, then let’s plan Saturday lunch.', confidence: .79, createdAt: '2026-08-30T18:02:26.000Z', source: 'speech' },
  { id: 'demo-5', lane: 'center', text: 'Noon works. I will book the table.', confidence: .86, createdAt: '2026-08-30T18:02:35.000Z', source: 'speech' },
  { id: 'demo-6', lane: 'right', text: 'Please choose somewhere quiet.', confidence: .9, createdAt: '2026-08-30T18:02:43.000Z', source: 'speech' }
];

const preferences = loadPreferences();
let captions: CaptionEntry[] = [];
let activeLane: LaneId = 'center';
let directionConfidence: number | null = null;
let paused = false;
// Typed sessions are an explicit no-microphone route. Keep that choice for the
// lifetime of the room so Pause/Resume cannot accidentally escalate it.
let sessionMode: 'microphone' | 'typed' | null = null;
let plus = false;
let mediaStream: MediaStream | null = null;
let audioContext: AudioContext | null = null;
let directionTimer = 0;

const speech = new OnDeviceSpeech(addSpeechCaption, showMicError, (listening) => {
  $('#room-status').textContent = listening ? 'Listening · audio stays on this device' : paused ? 'Paused · microphone is off' : 'Ready · audio stays on this device';
});

function isDemoUrl(): boolean {
  return location.pathname.replace(/\/+$/, '') === '/demo' || new URLSearchParams(location.search).get('demo') === '1';
}

function loadPreferences(): Preferences {
  try {
    const stored = JSON.parse(localStorage.getItem(preferencesKey) || '') as Partial<Preferences>;
    return {
      ...defaultPreferences,
      ...stored,
      lanes: { ...defaultPreferences.lanes, ...(stored.lanes || {}) }
    };
  } catch { return structuredClone(defaultPreferences); }
}

function savePreferences(): void {
  localStorage.setItem(preferencesKey, JSON.stringify(preferences));
  document.documentElement.style.setProperty('--caption-size', `${preferences.captionSize}px`);
}

async function discardDemo(): Promise<void> {
  if (!demoMode) return;
  await clearCaptions(databaseName);
  await new Promise<void>((resolve) => {
    const request = indexedDB.deleteDatabase(databaseName);
    request.onsuccess = () => resolve();
    request.onerror = () => resolve();
    request.onblocked = () => resolve();
  });
  localStorage.removeItem(preferencesKey);
}

function visibleLanes(): LaneId[] {
  return plus ? laneOrder : laneOrder.slice(0, 3);
}

function confidenceText(confidence: number | null): string {
  if (confidence === null) return 'Direction set manually';
  if (confidence >= .75) return 'Direction: strong';
  if (confidence >= .55) return 'Direction: likely';
  return 'Direction: uncertain';
}

function escapeText(value: string): string {
  const span = document.createElement('span');
  span.textContent = value;
  return span.innerHTML;
}

function setHeadingLevel(id: string, level: 1 | 2): void {
  const current = $<HTMLHeadingElement>(`#${id}`);
  if (current.tagName === `H${level}`) return;
  const next = document.createElement(`h${level}`);
  next.id = current.id;
  next.className = current.className;
  next.tabIndex = -1;
  next.textContent = current.textContent;
  current.replaceWith(next);
}

function setActiveViewHeadings(roomIsActive: boolean): void {
  if (roomIsActive) {
    setHeadingLevel('page-title', 2);
    setHeadingLevel('room-title', 1);
    return;
  }
  setHeadingLevel('room-title', 2);
  setHeadingLevel('page-title', 1);
}

function updateRouteMetadata(): void {
  const title = demoMode ? 'Demo — Caption Lanes' : 'Caption Lanes — Place captions by speaker direction';
  const description = demoMode
    ? 'Try separate caption lanes with a saved sample conversation and no microphone.'
    : 'Place live captions into left, centre, and right lanes during small in-person conversations.';
  const canonical = `https://speaker-lane-captions.sociobot.in${demoMode ? '/demo' : '/'}`;
  document.title = title;
  document.querySelector<HTMLMetaElement>('meta[name="description"]')?.setAttribute('content', description);
  document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute('href', canonical);
  document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.setAttribute('content', title);
  document.querySelector<HTMLMetaElement>('meta[property="og:description"]')?.setAttribute('content', description);
  document.querySelector<HTMLMetaElement>('meta[property="og:url"]')?.setAttribute('content', canonical);
  document.querySelector<HTMLMetaElement>('meta[name="twitter:title"]')?.setAttribute('content', title);
  document.querySelector<HTMLMetaElement>('meta[name="twitter:description"]')?.setAttribute('content', description);
}

function announceRoute(): void {
  const heading = $<HTMLHeadingElement>(demoMode ? '#room-title' : '#page-title');
  $('#routeAnnouncement').textContent = `${document.title}. ${heading.textContent || ''}`;
  heading.focus({ preventScroll: true });
}

async function applyRoute(options: { focus?: boolean; consent?: boolean } = {}): Promise<void> {
  const nextDemoMode = isDemoUrl();
  if (demoMode && !nextDemoMode) await discardDemo();
  stopAudio();
  paused = false;
  sessionMode = null;
  demoMode = nextDemoMode;
  databaseName = demoMode ? 'demo:caption-lanes' : 'caption-lanes';
  preferencesKey = demoMode ? 'demo:caption-lanes:preferences' : 'caption-lanes:preferences';
  Object.assign(preferences, demoMode ? structuredClone(defaultPreferences) : loadPreferences());
  $('#demoBanner').hidden = !demoMode;
  updateRouteMetadata();
  if (demoMode) {
    // Demo is a complete sandbox. A real entitlement already in memory must
    // never affect the sample lane count or the selected direction.
    plus = false;
    activeLane = 'center';
    directionConfidence = null;
    localStorage.removeItem(preferencesKey);
    captions = structuredClone(demoCaptions);
    await replaceCaptions(captions, databaseName);
    savePreferences();
    await startRoom(true);
  } else {
    captions = await loadCaptions(databaseName).catch(() => []);
    setActiveViewHeadings(false);
    $('#room').hidden = true;
    $('#welcome').hidden = false;
    savePreferences();
    plus = optimisticUnlock();
    void updateLicense();
    render();
    renderLaneSettings();
    if (options.consent) $('#consent-panel').scrollIntoView({ block: 'start' });
  }
  if (options.focus !== false) announceRoute();
}

async function navigateApp(url: URL): Promise<void> {
  const consent = url.hash === '#consent-panel';
  const targetIsDemo = url.pathname.replace(/\/+$/, '') === '/demo' || url.searchParams.get('demo') === '1';
  if (demoMode && !targetIsDemo) await discardDemo();
  history.pushState({ appRoute: true }, '', `${url.pathname}${url.search}${url.hash}`);
  await applyRoute({ consent });
}

function render(): void {
  const lanes = visibleLanes();
  $('#lanes').style.setProperty('--lane-count', String(lanes.length));
  $('#lanes').innerHTML = lanes.map((lane) => {
    const preference = preferences.lanes[lane];
    const entries = captions.filter((entry) => entry.lane === lane && (!preferences.hideUncertain || entry.confidence === null || entry.confidence >= .6)).slice(-12);
    const list = entries.length
      ? `<ol class="utterances" tabindex="0" aria-label="${escapeText(preference.label)} captions">${entries.map((entry) => `<li class="utterance">${escapeText(entry.text)}<time datetime="${entry.createdAt}">${new Date(entry.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}${entry.confidence === null ? ' · typed' : entry.confidence < .6 ? ' · uncertain' : ''}</time></li>`).join('')}</ol>`
      : `<p class="empty-lane">${laneMeta[lane].empty}</p>`;
    return `<section class="lane ${lane === activeLane ? 'active' : ''}" data-id="${lane}" style="--lane-color:${preference.color}" aria-label="${escapeText(preference.label)} caption lane">
      <header><span class="lane-direction">${laneMeta[lane].arrow} ${escapeText(preference.label)}</span><span class="confidence">${lane === activeLane ? confidenceText(directionConfidence) : 'Waiting'}</span></header>${list}</section>`;
  }).join('');
  renderDirectionButtons();
}

function renderDirectionButtons(): void {
  $('#directionButtons').innerHTML = visibleLanes().map((lane, index) => {
    const preference = preferences.lanes[lane];
    return `<button type="button" data-lane="${lane}" aria-pressed="${lane === activeLane}" style="--lane-color:${preference.color}">${laneMeta[lane].arrow} ${escapeText(preference.label)} <span class="visually-hidden">shortcut ${index + 1}</span></button>`;
  }).join('');
  $('#directionButtons').querySelectorAll<HTMLButtonElement>('button').forEach((button) => button.addEventListener('click', () => selectLane(button.dataset.lane as LaneId)));
}

function renderLaneSettings(): void {
  $('#laneSettings').innerHTML = visibleLanes().map((lane) => {
    const preference = preferences.lanes[lane];
    const defaultLabel = lane === 'center' ? 'Centre' : lane[0].toUpperCase() + lane.slice(1);
    return `<div class="lane-setting"><label for="lane-label-${lane}">${laneMeta[lane].arrow} ${defaultLabel} lane label</label><input id="lane-label-${lane}" class="lane-label-input" data-label-lane="${lane}" value="${escapeText(preference.label)}" maxlength="24" autocomplete="off" /><button class="swatch-button" type="button" data-color-lane="${lane}" style="--swatch:${preference.color}" aria-label="Change ${escapeText(preference.label)} lane color" ${preference.locked ? 'disabled' : ''}></button><button class="lock-button" type="button" data-lock-lane="${lane}" aria-pressed="${preference.locked}">${preference.locked ? 'Unlock lane color' : 'Lock lane color'}</button></div>`;
  }).join('');
  $('#laneSettings').querySelectorAll<HTMLInputElement>('[data-label-lane]').forEach((input) => input.addEventListener('change', () => {
    const lane = input.dataset.labelLane as LaneId;
    const nextLabel = input.value.trim();
    preferences.lanes[lane].label = nextLabel || defaultPreferences.lanes[lane].label;
    savePreferences(); renderLaneSettings(); render();
  }));
  $('#laneSettings').querySelectorAll<HTMLButtonElement>('[data-lock-lane]').forEach((button) => button.addEventListener('click', () => {
    const lane = button.dataset.lockLane as LaneId;
    preferences.lanes[lane].locked = !preferences.lanes[lane].locked;
    savePreferences(); renderLaneSettings();
  }));
  $('#laneSettings').querySelectorAll<HTMLButtonElement>('[data-color-lane]').forEach((button) => button.addEventListener('click', () => {
    const lane = button.dataset.colorLane as LaneId;
    const current = palette.indexOf(preferences.lanes[lane].color);
    preferences.lanes[lane].color = palette[(current + 1) % palette.length];
    savePreferences(); renderLaneSettings(); render();
  }));
}

function selectLane(lane: LaneId): void {
  activeLane = lane;
  directionConfidence = null;
  render();
}

async function addCaption(text: string, confidence: number | null, source: 'speech' | 'typed'): Promise<void> {
  const entry: CaptionEntry = {
    id: crypto.randomUUID(), lane: activeLane, text: text.trim(), confidence,
    createdAt: new Date().toISOString(), source
  };
  captions.push(entry);
  await saveCaption(entry, databaseName);
  render();
  const lane = $<HTMLElement>(`.lane[data-id="${activeLane}"]`);
  lane?.querySelector('.utterances')?.scrollTo({ top: 99999, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
}

function addSpeechCaption(caption: { text: string; confidence: number | null }): void {
  if (!paused) void addCaption(caption.text, caption.confidence, 'speech');
}

function showMicError(message: string): void {
  const notice = $('#micNotice');
  notice.textContent = message;
  notice.hidden = false;
}

async function startRoom(practice = false): Promise<void> {
  setActiveViewHeadings(true);
  $('#welcome').hidden = true;
  $('#room').hidden = false;
  if (!demoMode) $('#room').scrollIntoView({ block: 'start' });
  render();
  if (practice) {
    sessionMode = 'typed';
    paused = false;
    $('#room-status').textContent = 'Typed-caption mode · microphone is off';
    showMicError('Typed-caption mode is active. Choose a direction, then type each utterance below.');
    if (!demoMode) $('#typedCaption').focus();
    return;
  }
  sessionMode = 'microphone';
  if (!speech.supported()) {
    showMicError('On-device speech is not available in this browser. Use typed captions instead.');
    return;
  }
  if (await speech.start()) {
    if (speech.usesNativeBridge()) {
      showMicError('On-device Android captions are active. Choose Left, Centre, or Right when the speaker changes.');
    } else {
      await startDirectionAudio();
    }
  }
}

async function startDirectionAudio(): Promise<void> {
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: { ideal: 2 }, echoCancellation: false, noiseSuppression: false }, video: false });
    const track = mediaStream.getAudioTracks()[0];
    const settings = track.getSettings();
    if ((settings.channelCount || 1) < 2) {
      showMicError('This microphone exposes one audio channel, so automatic direction is limited. Tap Left, Centre, or Right when the speaker changes.');
      return;
    }
    audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(mediaStream);
    const splitter = audioContext.createChannelSplitter(2);
    const left = audioContext.createAnalyser();
    const right = audioContext.createAnalyser();
    left.fftSize = right.fftSize = 256;
    source.connect(splitter); splitter.connect(left, 0); splitter.connect(right, 1);
    const l = new Uint8Array(left.fftSize); const r = new Uint8Array(right.fftSize);
    directionTimer = window.setInterval(() => {
      left.getByteTimeDomainData(l); right.getByteTimeDomainData(r);
      const rms = (data: Uint8Array) => Math.sqrt(data.reduce((sum, sample) => sum + ((sample - 128) / 128) ** 2, 0) / data.length);
      const leftEnergy = rms(l); const rightEnergy = rms(r); const total = leftEnergy + rightEnergy;
      if (total < .025) return;
      const balance = (rightEnergy - leftEnergy) / total;
      const next: LaneId = balance < -.14 ? 'left' : balance > .14 ? 'right' : 'center';
      if (next !== activeLane) { activeLane = next; directionConfidence = Math.min(.92, .52 + Math.abs(balance)); render(); }
    }, 420);
  } catch (error) {
    const denied = error instanceof DOMException && error.name === 'NotAllowedError';
    showMicError(denied ? 'Microphone permission was denied. Allow it in your device settings, or use typed captions.' : 'The microphone could not start. Check that another app is not using it.');
  }
}

function stopAudio(): void {
  speech.stop();
  window.clearInterval(directionTimer);
  mediaStream?.getTracks().forEach((track) => track.stop());
  void audioContext?.close();
  mediaStream = null; audioContext = null;
}

function toast(message: string): void {
  const element = $('#toast'); element.textContent = message; element.hidden = false;
  window.setTimeout(() => { element.hidden = true; }, 4200);
}

function exportTranscript(): void {
  const payload = { product: 'Caption Lanes', exportedAt: new Date().toISOString(), rawAudioStored: false, captions };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = `caption-lanes-${new Date().toISOString().slice(0, 10)}.json`; link.click(); URL.revokeObjectURL(link.href);
  toast('Transcript exported.');
}

async function updateLicense(force = false): Promise<void> {
  if (demoMode) return;
  const routeAtStart = location.pathname;
  const result = await verifyLicense(force);
  if (demoMode || location.pathname !== routeAtStart) return;
  plus = result.valid;
  if (!plus && activeLane === 'across') {
    activeLane = 'center';
    directionConfidence = null;
    toast('Across closed because Plus is inactive. Centre is now selected.');
  }
  const status = $('#licenseStatus');
  status.textContent = result.valid ? 'Plus is active on this device.' : result.reason === 'offline' ? 'Offline. Using the last verified license state.' : result.reason === 'missing' ? '' : 'This license is no longer active.';
  render(); renderLaneSettings();
}

function bindEvents(): void {
  document.querySelector<HTMLAnchorElement>('.skip-link')?.addEventListener('click', (event) => {
    event.preventDefault();
    $('#main').focus();
  });
  $('#consentForm').addEventListener('submit', (event) => { event.preventDefault(); void startRoom(false); });
  $('#openPractice').addEventListener('click', () => void startRoom(true));
  $('#typeForm').addEventListener('submit', (event) => {
    event.preventDefault(); const input = $<HTMLInputElement>('#typedCaption');
    if (input.value.trim()) { void addCaption(input.value, null, 'typed'); input.value = ''; }
  });
  $('#pauseButton').addEventListener('click', () => {
    paused = !paused; const button = $('#pauseButton');
    if (paused) { stopAudio(); button.innerHTML = '<span aria-hidden="true">▶</span> Resume'; }
    else {
      button.innerHTML = '<span aria-hidden="true">Ⅱ</span> Pause';
      if (sessionMode === 'typed') {
        $('#room-status').textContent = 'Typed-caption mode · microphone is off';
        return;
      }
      if (sessionMode === 'microphone') void speech.start().then((started) => {
        if (started) return speech.usesNativeBridge() ? undefined : startDirectionAudio();
      });
    }
  });
  $('#endButton').addEventListener('click', () => { stopAudio(); paused = false; sessionMode = null; setActiveViewHeadings(false); $('#room').hidden = true; $('#welcome').hidden = false; $('#welcome').scrollIntoView(); $<HTMLHeadingElement>('#page-title').focus(); });
  $('#exportButton').addEventListener('click', exportTranscript);
  $('#openSettings').addEventListener('click', () => { renderLaneSettings(); $<HTMLDialogElement>('#settingsDialog').showModal(); });
  $('#openUpgrade').addEventListener('click', () => $<HTMLDialogElement>('#upgradeDialog').showModal());
  $('#openUpgradePlan').addEventListener('click', () => $<HTMLDialogElement>('#upgradeDialog').showModal());
  $('#captionSize').addEventListener('input', (event) => { preferences.captionSize = Number((event.target as HTMLInputElement).value); $('#sizeOutput').textContent = `${preferences.captionSize} px`; savePreferences(); });
  $('#hideUncertain').addEventListener('change', (event) => { preferences.hideUncertain = (event.target as HTMLInputElement).checked; savePreferences(); render(); });
  $('#clearButton').addEventListener('click', async () => {
    if (!confirm(`Clear ${captions.length} saved caption${captions.length === 1 ? '' : 's'} from this device?`)) return;
    await clearCaptions(databaseName); captions = []; render(); toast('Transcript cleared.');
  });
  $('#importButton').addEventListener('click', () => $<HTMLInputElement>('#importFile').click());
  $('#importFile').addEventListener('change', async (event) => {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0]; if (!file) return;
    let entries: CaptionEntry[];
    try {
      const parsed = JSON.parse(await file.text()) as { captions?: CaptionEntry[] } | CaptionEntry[];
      const imported = Array.isArray(parsed) ? parsed : parsed.captions;
      if (!imported || !imported.every((entry) => entry.id && laneOrder.includes(entry.lane) && entry.text && entry.createdAt)) throw new Error();
      entries = imported;
    } catch {
      toast('That file is not a Caption Lanes transcript.');
      input.value = '';
      return;
    }
    const currentCount = captions.length;
    const importedCount = entries.length;
    if (!confirm(`Import ${importedCount} caption${importedCount === 1 ? '' : 's'}? This will replace ${currentCount} saved caption${currentCount === 1 ? '' : 's'} on this device.`)) {
      input.value = '';
      return;
    }
    try {
      await replaceCaptions(entries, databaseName);
      captions = entries;
      render();
      toast(`${entries.length} captions imported.`);
    } catch {
      toast('The transcript could not be saved. Your current captions are unchanged.');
    } finally { input.value = ''; }
  });
  $('#restoreForm').addEventListener('submit', (event) => {
    event.preventDefault(); const input = $<HTMLInputElement>('#licenseInput');
    if (demoMode) { toast('Start for real before restoring a license.'); return; }
    if (!input.value.trim()) return; storeLicense(input.value); $('#licenseStatus').textContent = 'Checking license…'; void updateLicense(true);
  });
  $('#resetDemo').addEventListener('click', async () => {
    if (!demoMode) return;
    plus = false;
    Object.assign(preferences, structuredClone(defaultPreferences));
    localStorage.removeItem(preferencesKey);
    savePreferences();
    captions = structuredClone(demoCaptions);
    await replaceCaptions(captions, databaseName);
    activeLane = 'center';
    render(); renderLaneSettings();
    toast('Sample conversation reset.');
    $<HTMLHeadingElement>('#room-title').focus();
  });
  $('#startForReal').addEventListener('click', async () => {
    if (!demoMode) return;
    await navigateApp(new URL('/#consent-panel', location.href));
  });
  document.querySelectorAll<HTMLAnchorElement>('a[href="/demo"], a[href="/?demo=1"]').forEach((link) => link.addEventListener('click', (event) => {
    event.preventDefault();
    void navigateApp(new URL('/demo', location.href));
  }));
  window.addEventListener('popstate', () => { void applyRoute({ consent: location.hash === '#consent-panel' }); });
  window.addEventListener('pagehide', () => {
    stopAudio();
    if (demoMode) {
      localStorage.removeItem(preferencesKey);
      indexedDB.deleteDatabase(databaseName);
    }
  });
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') stopAudio(); });
  window.addEventListener('online', updateConnectivity); window.addEventListener('offline', updateConnectivity);
  window.addEventListener('keydown', (event) => {
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || event.ctrlKey || event.metaKey || event.altKey) return;
    const index = Number(event.key) - 1; const lanes = visibleLanes(); if (lanes[index]) selectLane(lanes[index]);
  });
}

function updateConnectivity(event?: Event): void {
  $('#offlineNotice').hidden = event?.type === 'offline' ? false : event?.type === 'online' ? true : navigator.onLine;
  if (event?.type === 'online' && !demoMode) void updateLicense(true);
}

async function registerServiceWorker(): Promise<void> {
  if (!('serviceWorker' in navigator)) return;
  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    registration.addEventListener('updatefound', () => {
      const worker = registration.installing;
      worker?.addEventListener('statechange', () => { if (worker.state === 'installed' && navigator.serviceWorker.controller) toast('An update is ready. Reopen Caption Lanes to use it.'); });
    });
  } catch { /* App remains usable without install support. */ }
}

async function init(): Promise<void> {
  history.replaceState({ appRoute: true }, '', location.href);
  if (demoMode) {
    $('#demoBanner').hidden = false;
    plus = false;
    activeLane = 'center';
    directionConfidence = null;
    Object.assign(preferences, structuredClone(defaultPreferences));
    localStorage.removeItem(preferencesKey);
    captions = structuredClone(demoCaptions);
    // Switch the direct /demo document before the first asynchronous storage
    // operation so the landing hero can never paint and then move the room.
    await startRoom(true);
    document.documentElement.classList.remove('demo-route-pending');
    await replaceCaptions(captions, databaseName);
  } else {
    captureReturnedLicense();
    plus = optimisticUnlock();
    captions = await loadCaptions(databaseName).catch(() => []);
  }
  updateRouteMetadata();
  savePreferences();
  $<HTMLInputElement>('#captionSize').value = String(preferences.captionSize);
  $('#sizeOutput').textContent = `${preferences.captionSize} px`;
  $<HTMLInputElement>('#hideUncertain').checked = preferences.hideUncertain;
  bindEvents(); render(); renderLaneSettings(); updateConnectivity();
  if (!demoMode) void updateLicense();
  void registerServiceWorker();
}

void init();
