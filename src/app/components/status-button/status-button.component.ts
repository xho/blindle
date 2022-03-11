import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-status-button',
  templateUrl: './status-button.component.html',
  styleUrls: ['./status-button.component.scss'],
})
export class StatusButtonComponent implements OnInit {

  @Input() guess: any;
  @Input() status: any;
  @Input() title: string;

  constructor() { }

  ngOnInit() {}

  public repeat() {
    console.log(1);
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
