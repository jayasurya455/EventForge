import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { NavigationService } from '../../services/navigation/navigation.service';
import { IconComponent } from '../icon/icon';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../button/button';

@Component({
  selector: 'form-logo',
  imports: [IconComponent, ButtonComponent, CommonModule],
  templateUrl: './form-logo.html',
  styleUrl: './form-logo.scss',
})
export class FormLogo implements OnChanges {
  @Input() urlPath: string = "";
  @Input() logobase64!: any;
  @Output() logoSelectedPath = new EventEmitter<{ source: string }>();
  logoImage: any;

  constructor(private navigationService: NavigationService, private cdr: ChangeDetectorRef) { }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['logobase64'] != undefined) {
      this.logoImage = this.logobase64;
    }
  }

  pickLeagueLogo() {
    this.navigationService.pickImage().then(data => {
      if (!data?.path) 
        return;
      this.urlPath = data.path;
      this.logoImage = data.image;
      this.logoSelectedPath.emit({ source: this.urlPath });
      this.cdr.detectChanges();
    }, err => {
      console.error('Failed to pick league logo:', err);
      this.cdr.detectChanges();
    });
  }
}
