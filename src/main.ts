import './styles.css';
import { clearCaptions, loadCaptions, replaceCaptions, saveCaption } from './db';
import { captureReturnedLicense, optimisticUnlock, storeLicense, verifyLicense } from './license';
import { OnDeviceSpeech } from './speech';
import type { CaptionEntry, LaneId, Preferences } from './types';

const $ = <T extends HTMLElement>(selector: string) => document.querySelector<T>(selector)!;
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

let preferences = loadPreferences();
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

function loadPreferences(): Preferences {
  try {
    const stored = JSON.parse(localStorage.getItem('caption-lanes:preferences') || '') as Partial<Preferences>;
    return {
      ...defaultPreferences,
      ...stored,
      lanes: { ...defaultPreferences.lanes, ...(stored.lanes || {}) }
    };
  } catch { return structuredClone(defaultPreferences); }
}

function savePreferences(): void {
  localStorage.setItem('caption-lanes:preferences', JSON.stringify(preferences));
  document.documentElement.style.setProperty('--caption-size', `${preferences.captionSize}px`);
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

function render(): void {
  const lanes = visibleLanes();
  $('#lanes').style.setProperty('--lane-count', String(lanes.length));
  $('#lanes').innerHTML = lanes.map((lane) => {
    const preference = preferences.lanes[lane];
    const entries = captions.filter((entry) => entry.lane === lane && (!preferences.hideUncertain || entry.confidence === null || entry.confidence >= .6)).slice(-12);
    const list = entries.length
      ? `<ol class="utterances">${entries.map((entry) => `<li class="utterance">${escapeText(entry.text)}<time datetime="${entry.createdAt}">${new Date(entry.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}${entry.confidence === null ? ' · typed' : entry.confidence < .6 ? ' · uncertain' : ''}</time></li>`).join('')}</ol>`
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
    return `<div class="lane-setting"><span>${laneMeta[lane].arrow} ${lane === 'center' ? 'Centre' : lane[0].toUpperCase() + lane.slice(1)}</span><button class="swatch-button" type="button" data-color-lane="${lane}" style="--swatch:${preference.color}" aria-label="Change ${lane} lane color" ${preference.locked ? 'disabled' : ''}></button><button class="lock-button" type="button" data-lock-lane="${lane}" aria-pressed="${preference.locked}">${preference.locked ? 'Locked' : 'Unlocked'}</button></div>`;
  }).join('');
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
  await saveCaption(entry);
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
  $('#welcome').hidden = true;
  $('#room').hidden = false;
  $('#room').scrollIntoView({ block: 'start' });
  render();
  if (practice) {
    sessionMode = 'typed';
    paused = false;
    $('#room-status').textContent = 'Typed-caption mode · microphone is off';
    showMicError('Typed-caption mode is active. Choose a direction, then type each utterance below.');
    $('#typedCaption').focus();
    return;
  }
  sessionMode = 'microphone';
  if (!speech.supported()) {
    showMicError('On-device speech is not available in this browser. Use typed captions, or open the Android build on a supported device.');
    return;
  }
  if (await speech.start()) await startDirectionAudio();
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
    showMicError(denied ? 'Microphone permission was denied. Allow it in Android settings, or use typed captions.' : 'The microphone could not start. Check that another app is not using it.');
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
  const result = await verifyLicense(force);
  plus = result.valid;
  const status = $('#licenseStatus');
  status.textContent = result.valid ? 'Plus is active on this device.' : result.reason === 'offline' ? 'Offline. Using the last verified license state.' : result.reason === 'missing' ? '' : 'This license is no longer active.';
  render(); renderLaneSettings();
}

function bindEvents(): void {
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
        if (started) return startDirectionAudio();
      });
    }
  });
  $('#endButton').addEventListener('click', () => { stopAudio(); paused = false; sessionMode = null; $('#room').hidden = true; $('#welcome').hidden = false; $('#welcome').scrollIntoView(); });
  $('#exportButton').addEventListener('click', exportTranscript);
  $('#openSettings').addEventListener('click', () => { renderLaneSettings(); $<HTMLDialogElement>('#settingsDialog').showModal(); });
  $('#openUpgrade').addEventListener('click', () => $<HTMLDialogElement>('#upgradeDialog').showModal());
  $('#captionSize').addEventListener('input', (event) => { preferences.captionSize = Number((event.target as HTMLInputElement).value); $('#sizeOutput').textContent = `${preferences.captionSize} px`; savePreferences(); });
  $('#hideUncertain').addEventListener('change', (event) => { preferences.hideUncertain = (event.target as HTMLInputElement).checked; savePreferences(); render(); });
  $('#clearButton').addEventListener('click', async () => {
    if (!confirm(`Clear ${captions.length} saved caption${captions.length === 1 ? '' : 's'} from this device?`)) return;
    await clearCaptions(); captions = []; render(); toast('Transcript cleared.');
  });
  $('#importButton').addEventListener('click', () => $<HTMLInputElement>('#importFile').click());
  $('#importFile').addEventListener('change', async (event) => {
    const file = (event.target as HTMLInputElement).files?.[0]; if (!file) return;
    try {
      const parsed = JSON.parse(await file.text()) as { captions?: CaptionEntry[] } | CaptionEntry[];
      const entries = Array.isArray(parsed) ? parsed : parsed.captions;
      if (!entries || !entries.every((entry) => entry.id && laneOrder.includes(entry.lane) && entry.text && entry.createdAt)) throw new Error();
      captions = entries; await replaceCaptions(entries); render(); toast(`${entries.length} captions imported.`);
    } catch { toast('That file is not a Caption Lanes transcript.'); }
  });
  $('#restoreForm').addEventListener('submit', (event) => {
    event.preventDefault(); const input = $<HTMLInputElement>('#licenseInput');
    if (!input.value.trim()) return; storeLicense(input.value); $('#licenseStatus').textContent = 'Checking license…'; void updateLicense(true);
  });
  window.addEventListener('online', updateConnectivity); window.addEventListener('offline', updateConnectivity);
  window.addEventListener('keydown', (event) => {
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || event.ctrlKey || event.metaKey || event.altKey) return;
    const index = Number(event.key) - 1; const lanes = visibleLanes(); if (lanes[index]) selectLane(lanes[index]);
  });
}

function updateConnectivity(event?: Event): void {
  $('#offlineNotice').hidden = event?.type === 'offline' ? false : event?.type === 'online' ? true : navigator.onLine;
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
  captureReturnedLicense();
  plus = optimisticUnlock();
  savePreferences();
  $<HTMLInputElement>('#captionSize').value = String(preferences.captionSize);
  $('#sizeOutput').textContent = `${preferences.captionSize} px`;
  $<HTMLInputElement>('#hideUncertain').checked = preferences.hideUncertain;
  captions = await loadCaptions().catch(() => []);
  bindEvents(); render(); renderLaneSettings(); updateConnectivity();
  void updateLicense(); void registerServiceWorker();
}

void init();
