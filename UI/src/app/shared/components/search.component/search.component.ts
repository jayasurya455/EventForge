import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IconComponent } from '../icon/icon';

@Component({
  selector: 'app-search',
  imports: [IconComponent],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss',
})
export class SearchComponent {
  @Input() label = 'Search';
  @Input() placeholder = 'Search…';
  @Output() searchChange = new EventEmitter<string>();

  onInput(event: Event) {
    this.searchChange.emit((event.target as HTMLInputElement).value);
  }
}
