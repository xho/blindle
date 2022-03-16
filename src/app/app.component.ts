import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { IonInput, ToastController, Platform } from '@ionic/angular';
import { SpeakService } from './services/speak.service';
import { WordsService } from './services/words.service';
import { MessageService } from './services/message.service';
import { DateChangeService } from './services/date-change.service';
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
  public isExpired = false;

  constructor(
    private toastController: ToastController,
    private dateChangeService: DateChangeService,
    private speakService: SpeakService,
    public wordsService: WordsService,
    public messageService: MessageService,
    public platform: Platform,
  ) {
    this.dateChangeService.todayExpired$.subscribe(value => {
      this.isExpired = value;
      if (value) {
        this.reportExpired();
      }
    });
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


  public onKeyPress(e): void {
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
      const key = (letterStatus.status === 'absent')? 'absent' : 'present';
      if (!this.letterStatuses[key]?.includes(letterStatus.letter)) {
        const l = letterStatus.letter.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
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

  private async reportExpired() {
    const toast = await this.toastController.create({
      message: 'Non stai giocando con la parola di oggi, ricarica per aggiornare',
      icon: 'reload',
      position: 'bottom',
      color: 'warning',
      buttons: [
        {
          text: 'Ignora',
          role: 'cancel',
          handler: () => { }
        }, {
          text: 'Ricarica',
          handler: () => {
            window.location.reload();
          }
        }
      ]
    });
    await toast.present();
  }
}
