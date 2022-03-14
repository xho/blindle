import { Component, Input, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';
import { WordsService } from 'src/app/services/words.service';

@Component({
  selector: 'app-share-button',
  templateUrl: './share-button.component.html',
  styleUrls: ['./share-button.component.scss'],
})
export class ShareButtonComponent implements OnInit {

  @Input() guesses: Array<any>;
  @Input() guessesStatuses: Array<any>;

  public isCopied = false;

  constructor(
    private wordsService: WordsService,
    public platform: Platform,
  ) { }

  ngOnInit() {}

  public share = () => {
    const text = this.shareText();
    const navigator = window.navigator;

    if (this.platform.is('mobile') && navigator.share) {
      navigator.share({
        title: 'Parolette',
        text,
        url: 'https://blindle-game.netlify.app/',
      })
      .then(() => console.log('Successful share'))
      .catch((error: any) => console.log('Error sharing', error));
    } else {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          this.isCopied = true;
          setTimeout(() => {
            this.isCopied = false;
          }, 2000);
        });
    }
  };

  private shareText() {
    const success = this.guesses[this.guesses.length - 1].status === 'correct';
    let text = `Blindle ${this.wordsService.getSolutionMeta().index} ` + (success? this.guesses.length : 'x') + '/6';
    text += `\n(parolette alla cecata)`;
    text += `\n${this.wordsService.getSolutionMeta().date}\n\n`;

    this.guessesStatuses.forEach(guess => {
      guess.forEach((entry: any, i: number) => {
        if (i !== 0) {
          text += ' ';
        }
        if (entry.status === 'absent') {
          text += 'NO';
        }
        if (entry.status === 'present') {
          text += 'NI';
        }
        if (entry.status === 'correct') {
          text += 'SI';
        }
      });

      text += '\n';
    });

    return text;
  };

}
