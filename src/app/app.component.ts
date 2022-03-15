import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { IonInput, ToastController, Platform } from '@ionic/angular';
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
  public attempts = 6;
  public endMessage = '';
  public letterStatuses = {
    absent: [],
    present: [],
  };

  constructor(
    private toastController: ToastController,
    private speakService: SpeakService,
    public wordsService: WordsService,
    public messageService: MessageService,
    public platform: Platform,
  ) {

  }

  async ngAfterViewInit(): Promise<void> {
    this.ionInput?.setFocus();
    const init = await this.speakService.init();
    if (!init) {
      const message = MESSAGES.errors.speechSynthesisUnsupported;
      this.reportErrorVisually(message);
      throw new Error(message);
    }

    this.initListers();
  }


  public onKeyPress(e: KeyboardEvent): void {
    if (e.code === 'Enter') {
      this.try();
      return;
    }

    // text could be selected for overwrite
    if (document.getSelection().toString().toLowerCase() !== this.currentWord.toLowerCase() && this.currentWord.length === 5) {
      this.speakService.speak(MESSAGES.errors.wordIsMaxLength);
      return;
    }

    const pattern = /^[A-zÀ-ÿ]+$/i;
    const result = pattern.test(e.key);
    if (!result) {
      this.speakService.speak(e.key);
      this.speakService.speak(MESSAGES.errors.letterIsNotValid);
    } else {
      this.speakService.speak(e.key);
    }
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
    statuses.forEach(letterStatus => {
      this.speakService.speak(MESSAGES.var.letter + ', ' + letterStatus.letter);
      this.speakService.speak(MESSAGES.statuses[letterStatus.status]);
      if (!this.letterStatuses[letterStatus.status]?.includes(letterStatus.letter)) {
        const l = letterStatus.letter.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const key = (letterStatus.status === 'absent')? 'absent' : 'present';
        this.letterStatuses[key].push(l);
      }
    });

    if (this.wordsService.isWinningWord(this.currentWord)) {
      this.updateGuesses(statuses);
      this.endMessage = MESSAGES.var.successEnd;
      this.speakService.speak(MESSAGES.var.successEnd);
      return;
    } else {
      this.speakService.repeatWord(this.currentWord, statuses);
      if (this.guesses.length < this.attempts - 1) {
        this.speakService.speak(MESSAGES.var.retry);
      }
    }

    // END OR CONTINUE
    this.updateGuesses(statuses);
    if (this.guesses.length === this.attempts) {
      this.speakService.speak(MESSAGES.interjections.ouch);
      this.speakService.speak(MESSAGES.var.ended);
      this.endMessage = MESSAGES.var.failEnd;
    }
  }

  public sayLettersByStatus(status: string) {
    if (!this.letterStatuses[status].length) {
      this.speakService.speak(MESSAGES.var[status + 'LettersSummaryEmpty']);
      return;
    }

    this.speakService.speak(MESSAGES.var[status + 'LettersSummary']);
    this.speakService.speak(MESSAGES.var[status + 'Are'] + this.letterStatuses[status].length + MESSAGES.var.letters);
    this.letterStatuses[status].forEach((letter: string) => {
      this.speakService.speak(letter);
    });
  }

  private updateGuesses(statuses) {
    let wordStatus: string;
    if (statuses.every(letterStatus => letterStatus.status === 'absent')) {
      wordStatus = 'absent';
    } else if (statuses.every(letterStatus => letterStatus.status === 'correct')) {
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
