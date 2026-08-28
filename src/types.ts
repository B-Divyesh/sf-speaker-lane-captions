export type LaneId = 'left' | 'center' | 'right' | 'across';

export interface CaptionEntry {
  id: string;
  lane: LaneId;
  text: string;
  confidence: number | null;
  createdAt: string;
  source: 'speech' | 'typed';
}

export interface LanePreference {
  label: string;
  color: string;
  locked: boolean;
}

export interface Preferences {
  captionSize: number;
  hideUncertain: boolean;
  lanes: Record<LaneId, LanePreference>;
}
