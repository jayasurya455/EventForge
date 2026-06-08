import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button',
  imports: [CommonModule],
  templateUrl: './button.html'
})
export class ButtonComponent {
  @Input() variant: 'primary' | 'success' | 'secondary' | 'outline' | 'theme' = 'primary';
  @Input() color!: 'purple' | 'blue' | 'green' | 'red';
  @Input() disabled = false;
  @Output() clickTriggered = new EventEmitter();

  onClick() {
    this.clickTriggered.emit();
  }
}
