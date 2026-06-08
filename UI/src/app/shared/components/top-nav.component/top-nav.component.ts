import { ChangeDetectorRef, Component, DOCUMENT, Inject, Input, OnInit, signal, TemplateRef } from '@angular/core';
import { IconComponent } from '../icon/icon';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavigationService } from '../../services/navigation/navigation.service';

@Component({
  selector: 'app-top-nav',
  imports: [IconComponent, RouterModule, CommonModule],
  templateUrl: './top-nav.component.html',
  styleUrl: './top-nav.component.scss',
})
export class TopNavComponent implements OnInit {
  @Input() leftTemplate: TemplateRef<any> | null = null;
  @Input() rightTemplate: TemplateRef<any> | null = null;
  @Input() centerTemplate: TemplateRef<any> | null = null;
  isDarkTheme = signal(false);
  constructor(@Inject(DOCUMENT) private document: Document, private cdr: ChangeDetectorRef, public router: Router, private navigationService: NavigationService) { }

  ngOnInit(): void {
    const body = this.document.body;
    this.isDarkTheme.set(body.getAttribute('data-theme') === 'dark');
    body.setAttribute('data-theme', this.isDarkTheme() ? 'dark' : 'light');
    this.cdr.detectChanges();
  }

  toggleTheme() {
    const body = this.document.body;
    body.setAttribute('data-theme', this.isDarkTheme() == true ? 'light' : 'dark');
    this.isDarkTheme.set(!this.isDarkTheme());
    this.cdr.detectChanges();
  }

}
