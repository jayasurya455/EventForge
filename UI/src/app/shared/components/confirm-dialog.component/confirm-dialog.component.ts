import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IconComponent } from '../icon/icon';
import { ButtonComponent } from '../button/button';

@Component({
  selector: 'app-confirm-dialog',
  imports: [IconComponent, ButtonComponent],
  templateUrl: './confirm-dialog.component.html'
})
export class ConfirmDialogComponent {
  @Input() title = 'Are you sure?';
  @Input() message = 'This action cannot be undone.';
  @Input() confirmText = 'Yes, Confirm';
  @Input() cancelText = 'Cancel';

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
}
