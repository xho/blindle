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
    if ('onvoiceschanged' in speechSynthesis) {
      const awaitVoices = new Promise(done => window.speechSynthesis.onvoiceschanged = done);
      await awaitVoices;
    }

    const voices = window.speechSynthesis.getVoices();
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
    rate: number = 1.1,
  ): Promise<void> {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'it-IT';

    if (!voice) {
      utterance.voice = this.voice;
    }
    utterance.rate = rate;

    window.speechSynthesis.speak(utterance);
    utterance.onend = () => true;
  }

  public repeatWord(word: string, statuses: Array<any>) {
    this.speak(MESSAGES.var.iRepeat + word);
    statuses.forEach(status => {
      this.speak(MESSAGES.statuses[status.key]);
    });
  }

}
