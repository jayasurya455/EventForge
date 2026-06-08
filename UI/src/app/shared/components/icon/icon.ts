import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { IconName } from '../../constants';

@Component({
  selector: 'app-icon',
  imports: [CommonModule],
  templateUrl: './icon.html',
  styleUrl: './icon.scss',
})
export class IconComponent implements OnChanges {
  @Input() name!: IconName;
  @Input() imageLogo: any = null;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';

  svgContent: SafeHtml | null = null;

  constructor(private sanitizer: DomSanitizer, private cdr: ChangeDetectorRef) { }

  get sizeClass(): string {
    switch (this.size) {
      case 'sm': return 'w-4 h-4';
      case 'lg': return 'w-6 h-6';
      default: return 'w-5 h-5';
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.name) return;
    this.loadIcon();
  }

  private async loadIcon() {
    if (this.name == 'custom') {
      this.svgContent = this.imageLogo;
    } else {
      const res = await fetch(`assets/icons/materials/${this.name}.svg`);
      let svg = await res.text();
      svg = svg.replace(
        '<svg',
        `<svg class="ef-svg ef-svg-${this.name} ${this.sizeClass}"`
      );

      // 🔹 Force currentColor if missing
      svg = svg.replace(/fill="[^"]*"/g, 'fill="currentColor"');

      this.svgContent =
        this.sanitizer.bypassSecurityTrustHtml(svg);
    }
    this.cdr.detectChanges();
  }
}
