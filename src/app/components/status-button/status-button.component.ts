import { Component, Input, OnInit } from '@angular/core';
import { SpeakService } from '../../services/speak.service';

@Component({
  selector: 'app-status-button',
  templateUrl: './status-button.component.html',
  styleUrls: ['./status-button.component.scss'],
})
export class StatusButtonComponent implements OnInit {

  @Input() guess: any;
  @Input() status: any;
  @Input() title: string;

  constructor(
    private speakService: SpeakService,
  ) { }

  ngOnInit() {}

  public repeat() {
    this.speakService.repeat(this.guess.word, this.status);
  }

  public color(status?: string) {
    if (status === 'correct') {
      return 'success';
    }
    if (status === 'present') {
      return 'warning';
    }

    return 'dark';
  }
}
