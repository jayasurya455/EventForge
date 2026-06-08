import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, DOCUMENT, Inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, RouterModule],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App implements OnInit{

  constructor(@Inject(DOCUMENT) private document: Document) {}

  ngOnInit(): void {
    const body = this.document.body;
    body.setAttribute('data-theme', 'dark');
  }

}
