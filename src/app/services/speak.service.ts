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
    if (!this.window.speechSynthesis) {
      return false;
    }
    if ('onvoiceschanged' in this.window.speechSynthesis) {
      const awaitVoices = new Promise(done => this.window.speechSynthesis.onvoiceschanged = done);
      await awaitVoices;
    }

    const voices = this.window.speechSynthesis.getVoices();
    const italianVoices = voices.filter(voice => voice.lang === 'it-IT');
    this.voice = italianVoices[1];
    return true;
  }

  public async speak(
    text: string = '',
    voice?: SpeechSynthesisVoice,
    rate: number = 1.2,
  ): Promise<void> {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'it-IT';

    if (!voice) {
      utterance.voice = this.voice;
    }
    utterance.rate = rate;

    await new Promise(resolve => {
      utterance.onend = resolve;
      this.window.speechSynthesis.speak(utterance);
    });
  }

  public repeatWord(word: string, statuses: Array<any>) {
    this.speak(MESSAGES.var.iRepeat + word);
    statuses.forEach(letterStatus => {
      this.speak(MESSAGES.statuses[letterStatus.status]);
    });
  }

}
