import { Injectable } from '@angular/core';
import { WORDS } from '../constants/dictionary';
import { SOLUTIONS } from '../constants/solutions';

@Injectable({
  providedIn: 'root'
})
export class WordsService {

  private solution: string;

  constructor() {
    this.solution = this.getWordOfDay();
  }

  public getSolution() {
    return this.solution;
  }

  public isWordInDictionary = (word: string) => WORDS.includes( word.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') );

  public isWinningWord = (word: string) => this.solution === word.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  public testWord = (word: string): Array<{ letter: string; key: string }> => {
    const splitSolution = this.solution.split('');
    const splitWord = word.toLowerCase().split('');
    const solutionCharsTaken = splitSolution.map(_ => false);
    const statuses = Array.from(Array(word.length));

    // handle all correct cases first
    splitWord.forEach((letter, i) => {
      if (letter === splitSolution[i]) {
        statuses[i] = {
          letter,
          key: 'correct',
        };
        solutionCharsTaken[i] = true;
        return;
      }
    });

    splitWord.forEach((letter, i) => {
      if (statuses[i]) {
        return;
      }

      // handles the absent case
      if (!splitSolution.includes(letter)) {
        statuses[i] = {
          letter,
          key: 'absent',
        };

        return;
      }

      // now we are left with 'present's
      const indexOfPresentChar = splitSolution.findIndex(
        (x, index) => x === letter && !solutionCharsTaken[index]
      );

      if (indexOfPresentChar > -1) {
        statuses[i] = {
          letter,
          key: 'present',
        };
        solutionCharsTaken[indexOfPresentChar] = true;
        return;
      } else {
        statuses[i] = {
          letter,
          key: 'absent',
        };
        return;
      }
    });

    return statuses;
  };

  public solutionMeta() {
    return {
      date: new Date().toLocaleString('it-IT'),
      index: this.getTodayIndex() + 1,
      total: WORDS.length,
    };
  };

  public dictionarySize() {
    return WORDS.length;
  }

  private getWordOfDay = () => {
    const index = this.getTodayIndex();
    return SOLUTIONS[index].toLowerCase();
  };

  private getTodayIndex = () => {
    const epochMs = 1641942000000; // init January 12, 2022 CET
    const now = Date.now();
    const msInDay = 86400000;
    return Math.floor((now - epochMs) / msInDay);
  };
}
