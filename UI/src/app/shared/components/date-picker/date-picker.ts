import {
  Component,
  ElementRef,
  forwardRef,
  Input,
  ViewChild,
  AfterViewInit,
  OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import flatpickr from 'flatpickr';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-date-picker',
  standalone: true,
  imports: [CommonModule],
  styleUrl: './date-picker.scss',
  template: `
    <input
      #input
      type="text"
      class="ef-date-picker"
      [placeholder]="placeholder"
    />
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatePickerComponent),
      multi: true
    }
  ]
})
export class DatePickerComponent
  implements AfterViewInit, OnDestroy, ControlValueAccessor {

  @ViewChild('input', { static: true }) input!: ElementRef<HTMLInputElement>;

  @Input() placeholder: string = 'Select date';

  private picker: any;
  private onChange = (value: any) => { };
  private onTouched = () => { };

  ngAfterViewInit(): void {
    this.picker = flatpickr(this.input.nativeElement, {
      dateFormat: 'Y-m-d',
      onChange: (selectedDates: Date[]) => {
        const value = selectedDates.length
          ? selectedDates[0].toISOString().split('T')[0]
          : null;

        this.onChange(value);
      }
    });
  }

  writeValue(value: string | null): void {
    if (this.picker) {
      this.picker.setDate(value ?? null, false);
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    if (this.picker) {
      this.picker.input.disabled = isDisabled;
    }
  }

  ngOnDestroy(): void {
    if (this.picker) {
      this.picker.destroy();
    }
  }
}
