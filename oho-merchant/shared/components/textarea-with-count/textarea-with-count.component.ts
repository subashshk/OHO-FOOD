import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { subscribedContainerMixin } from '../../subscribedContainer.mixin';

@Component({
  selector: 'app-textarea-with-count',
  templateUrl: './textarea-with-count.component.html',
  styleUrls: ['./textarea-with-count.component.scss'],
})
export class TextareaWithCountComponent extends subscribedContainerMixin() implements OnInit {
  @ViewChild('textAreaInput', { static: false })

  public inputValue: string = '';
  public count: number = 0;
  public disabled: boolean = false;
  public textArea: any;

  @Input() maxInput: number = 300;
  @Input() placeholderText: string = 'Enter your question here...';

  @Output() formSubmitEvent: EventEmitter<boolean>;

  constructor() {
    super();
  }

  ngOnInit(): void {
    if (this.formSubmitEvent) {
      this.formSubmitEvent.pipe(takeUntil(this.destroyed$)).subscribe((data) => {
        this.textArea.el.value = '';
        this.count = 0;
      });
    }
  }

  public onInputChange(event: Event): void {
    if (event) {
      this.inputValue = (event.target as HTMLInputElement).value;
      this.count = this.inputValue.length;
      this.onChanged(this.inputValue);
    }
  }

  /////////////////////////////////////
  // CONTROL VALUE ACCESSOR OVERIDES //
  /////////////////////////////////////

  // Allows Angular to update the model
  // Update the model and changes needed for the view here.
  writeValue(val: string): void {
    this.inputValue = val ? val : '';
  }

  // Allows Angular to register a function to call when the model (rating) changes.
  // Save the function as a property to call later here.
  registerOnChange(fn: any): void {
    this.onChanged = fn;
  }

  // Allows Angular to register a function to call when the input has been touched.
  // Save the function as a property to call later here.
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  // Allows Angular to disable the input.
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onChanged: any = () => {};
  onTouched: any = () => {};

}
