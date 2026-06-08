import { Component, Input, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { ButtonComponent } from '../button/button';
import { IconComponent } from '../icon/icon';
import { CommonService } from '../../services/common/common.service';
import { ReplaySubject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'footer-action-bar',
  imports: [ButtonComponent, IconComponent, CommonModule],
  templateUrl: './footer-action-bar.html',
  styleUrl: './footer-action-bar.scss',
})
export class FooterActionBar implements OnInit, OnDestroy {
  @Input() usedFor: string = '';
  @Input() templateForFooter: TemplateRef<any> | null = null;
  private destroy$: ReplaySubject<boolean> = new ReplaySubject<boolean>(1);
  public selectedItems: any[] = [];

  constructor(
    private commonService: CommonService
  ) { }
  ngOnInit(): void {
    this.commonService.getSelectedPlayers$.pipe(takeUntil(this.destroy$)).subscribe((selectedPlayers) => {
      this.selectedItems = selectedPlayers;
    });
  }
  
  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
