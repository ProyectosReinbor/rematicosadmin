export interface TTSProvider {
  name: string;
  initialize(config: Record<string, unknown>): Promise<void>;
  speak(text: string, options: TTSOptions): Promise<Buffer>;
  listVoices(): Promise<TTSVoice[]>;
}

export interface TTSOptions {
  voice: string;
  speed: number;
  volume: number;
  language: string;
}

export interface TTSVoice {
  id: string;
  name: string;
  language: string;
  gender: "male" | "female";
}