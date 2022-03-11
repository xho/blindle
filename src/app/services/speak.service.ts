import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SpeakService {

  private voice: any;

  constructor(
    private window: Window
  ) { }

  async init(): Promise<boolean> {
      const awaitVoices = new Promise(done => this.window.speechSynthesis.onvoiceschanged = done);

      await awaitVoices;
      const voices = this.window.speechSynthesis.getVoices();
      const italianVoices = voices.filter(voice => voice.lang === 'it-IT');
      if (!italianVoices.length) {
        return false;
      }

      this.voice = italianVoices[1];
      return true;
  }

  public async speak(
    text: string = '',
    voice?: SpeechSynthesisVoice,
    rate: number = .8,
  ): Promise<void> {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'it-IT';

    if (!voice) {
      utterance.voice = this.voice;
    }
    if (rate) {
      utterance.rate = rate;
    }

    window.speechSynthesis.speak(utterance);
    utterance.onend = () => true;
  }
}
