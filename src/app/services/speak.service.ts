import { Injectable } from '@angular/core';
import { MESSAGES } from '../constants/messages';

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
    rate: number = .9,
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

  public repeat(word: string, statuses: Array<any>) {
    this.speak(MESSAGES.var.iRepeat + word);
    statuses.forEach(status => {
      this.speak(MESSAGES.statuses[status.key]);
    });
  }

}
