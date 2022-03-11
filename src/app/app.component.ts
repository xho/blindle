import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { IonInput, ToastController } from '@ionic/angular';
import { SpeakService } from './services/speak.service';
import { WordsService } from './services/words.service';
import { MessageService } from './services/message.service';
// import { GuessService } from './services/guess.service';

import { MESSAGES } from './constants/messages';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements AfterViewInit {

  @ViewChild('myInput') ionInput: IonInput;

  public inputLabel = MESSAGES.inputLabels[0];
  public currentWord = '';
  public guesses = [];
  public guessesStatuses = [];
  public attempts = 5;
  public endMessage = '';

  constructor(
    private toastController: ToastController,
    private speakService: SpeakService,
    private wordsService: WordsService,
    public messageService: MessageService,
  ) {

  }

  async ngAfterViewInit(): Promise<void> {
    this.ionInput.setFocus();
    const init = await this.speakService.init();
    if (!init) {
      const message = MESSAGES.errors.speechSynthesisUnsupported;
      this.reportErrorVisually(message);
      throw new Error(message);
    }

    this.initListers();
  }


  public onKeyPress(e: KeyboardEvent) {
   if (e.code === 'Enter') {
    this.try();
    return;
   }

   if (this.currentWord.length === 5) {
    this.speakService.speak(MESSAGES.errors.wordIsMaxLength);
    return;
   }

   const pattern = /^[a-z]+$/i;
   const result = pattern.test(e.key);
   if (!result) {
    this.speakService.speak(e.key);
    this.speakService.speak(MESSAGES.errors.letterIsNotValid);
   } else {
    this.speakService.speak(e.key);
   }

   return result;
  }

  public async try() {
    // too short
    if (this.currentWord.length < 5) {
      this.speakService.speak(MESSAGES.errors.wordIsNotComplete);
      this.speakService.speak(MESSAGES.var.insertedOnly + this.currentWord.length + MESSAGES.var.letters);
      return;
    }

    this.speakService.speak(this.currentWord);

    // NOT IN DICTIONARY
    if (!this.wordsService.isWordInDictionary(this.currentWord)) {
      this.speakService.speak(MESSAGES.var.theWord + this.currentWord);
      await this.speakService.speak(MESSAGES.errors.notInDictionary);
      this.currentWord = '';
      return;
    }

    // OK HOW IS GONE?
    const statuses = this.wordsService.testWord(this.currentWord);
    statuses.forEach(status => {
      this.speakService.speak(MESSAGES.var.letter);
      this.speakService.speak(status.letter);
      this.speakService.speak(MESSAGES.statuses[status.key]);
    });

    if (this.currentWord.toLowerCase() !== this.wordsService.getSolution()) {
      this.speakService.repeat(this.currentWord, statuses);
      if (this.guesses.length < this.attempts) {
        this.speakService.speak(MESSAGES.var.retry);
      }
    } else {
      this.updateGuesses(statuses);
      this.endMessage = MESSAGES.var.successEnd;
      return;
    }

    // END OR CONTINUE
    this.updateGuesses(statuses);
    if (this.guesses.length === this.attempts) {
      this.speakService.speak(MESSAGES.interjections.ouch);
      this.speakService.speak(MESSAGES.var.ended);
      this.endMessage = MESSAGES.var.failEnd;
    }
  }

  private updateGuesses(statuses) {
    let wordStatus: string;
    if (statuses.every(status => status.key === 'absent')) {
      wordStatus = 'absent';
    } else if (statuses.every(status => status.key === 'correct')) {
      wordStatus = 'correct';
    } else {
      wordStatus = 'present';
    }

    this.guesses.push({ word: this.currentWord, status: wordStatus });
    this.guessesStatuses.push(statuses);
    this.currentWord = '';
  }

  private initListers() {
    document.addEventListener('mousedown', (e: MouseEvent) => {
      const target = e.target as HTMLInputElement;
      if (!target.type) {
        setTimeout(() => {
          this.ionInput?.setFocus();
        }, 300);
      }
    });
  }

  private async reportErrorVisually(message = '') {
    const toast = await this.toastController.create({
      header: 'ERRORE',
      message,
      icon: 'bug',
      position: 'middle',
      color: 'danger',
      buttons: [
      ]
    });
    await toast.present();
  }

}
