import { Component, Input } from '@angular/core';
import { IconComponent } from '../../../shared/components/icon/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auction-stepper',
  imports: [IconComponent, CommonModule],
  templateUrl: './auction-stepper.component.html',
  styleUrls: ['./auction-stepper.component.scss']
})
export class AuctionStepperComponent {
  @Input() currentStep: any;
  @Input() steps: any[] = [];
}
