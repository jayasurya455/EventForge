import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon';
import { IconName } from '../../constants';

@Component({
  selector: 'app-action-card',
  imports: [CommonModule, IconComponent],
  templateUrl: './action-card.html'
})
export class ActionCardComponent {
  @Input() icon!: IconName;
  @Input() title!: string;
  @Input() subtitle!: string;
}
