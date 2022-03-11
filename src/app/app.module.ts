import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AppComponent } from './app.component';
import { StatusButtonComponent } from './components/status-button/status-button.component';


@NgModule({
  declarations: [AppComponent, StatusButtonComponent],
  entryComponents: [],
  imports: [BrowserModule, IonicModule.forRoot(), FormsModule],
  providers: [
    { provide: Window, useValue: window }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
