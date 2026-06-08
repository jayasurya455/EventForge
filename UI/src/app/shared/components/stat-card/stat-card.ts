import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon';
import { IconName } from '../../constants';

@Component({
  selector: 'app-stat-card',
  imports: [CommonModule, IconComponent],
  templateUrl: './stat-card.html'
})
export class StatCardComponent {
  @Input() icon!: IconName;
  @Input() label!: string;
  @Input() value!: string | number | undefined;
  @Input() compact: boolean = false;
}

