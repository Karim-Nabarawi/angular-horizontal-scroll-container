import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostBinding,
  HostListener,
  Input,
  TemplateRef,
  ViewChild,
} from '@angular/core';

import { ImageScrollButtonsComponent } from '../components/scroll-buttons/scroll-buttons.component';
import {
  IMainStyles,
  IMainStylesDefault,
} from '../shared/interface/main.interface';
import { IScrollBtnStyles } from '../shared/interface/button.interface';
/**
 * Represents the vertical scroll component's input properties.
 *
 * @see {@link AngularVerticalScrollComponent} for the main component.
 * @usageNotes
 * This component provides vertical scrolling functionality for content. You can customize its appearance
 * and behavior using the input properties provided by {@link AngularVerticalScrollInput}.
 *
 * Usage example:
 * ```html
 * <vertical-scroll
 *   [scrollAmount]="100"
 *   [headerTitleTemplate]="customHeaderTemplate"
 *   [scrollButtonTemplate]="customButtonTemplate"
 *   [scrollButtonPosition]="'top right'"
 *   [showScrollbar]="true"
 *   [customStyles]="customStylesObject"
 * ></vertical-scroll>
 * ```
 */
@Component({
  selector: 'vertical-scroll',
  standalone: true,
  imports: [CommonModule, ImageScrollButtonsComponent],
  templateUrl: './angular-vertical-scroll.component.html',
  styleUrls: ['./angular-vertical-scroll.component.scss'],
})
export class AngularVerticalScrollComponent {
  @ViewChild('widgetsContent', { static: false }) widgetsContent!: ElementRef;

  /**
   * @description
   * The amount to scroll when the user interacts with the component.
   *
   * @default 'auto'
   * @usageNotes
   * 'auto' is calculated based on first element size,
   * 'full' is calculated based on full content width except one element,
   * number is value which scroll change in px
   */
  @Input() scrollAmount: number | 'auto' | 'full' = 'auto';
  /**
   * @description
   * The template for the header title of the scroll component.
   * Can be a string or a TemplateRef<void> instance.
   * @default ''
   */
  @Input() headerTitleTemplate: string | TemplateRef<void> = '';
  /**
   * @description
   * The template for the scroll buttons in the scroll component.
   * Must be a TemplateRef<void> instance.
   */
  @Input() scrollButtonTemplate!: TemplateRef<void>;
  /**
   * @description
   * The position of the scroll buttons.
   * Can be 'center' to place them in the center, or 'top right' to place them at the top right corner.
   * @default 'center'
   */
  @Input() scrollButtonPosition: 'center' | 'top right' = 'center';
  /**
   * @description
   * Determines whether the scrollbar is shown in the scroll component.
   * @default false
   */
  @Input() showScrollbar: boolean = false;

  /**
   * @description
   * Custom styles to apply to the scroll component.
   * @see {@link IMainStyles} for available style properties.
   */

  @Input() set customStyles(value: Partial<IMainStyles>) {
    this.mainStyles = {
      ...IMainStylesDefault,
      ...value,
    };

    //default firstElementLeftMargin to be same as elements gap when not set for equal spacing
    this.mainStyles.firstElementLeftMargin = value.firstElementLeftMargin
      ? value.firstElementLeftMargin
      : this.mainStyles.elementsGap;
  }

  mainStyles: IMainStyles = IMainStylesDefault;

  hasOverflow = false;
  overflowValue: 'left' | 'both' | 'right' = 'left';

  @HostBinding('style.--default-elements-gap') get elementsGap() {
    return `${this.mainStyles.elementsGap}px`;
  }

  constructor(private cdRef: ChangeDetectorRef) {}

  ngAfterViewInit() {
    this.checkOverflow();
    this.cdRef.detectChanges();
  }

  get buttonStyles(): IScrollBtnStyles {
    return this.mainStyles as IScrollBtnStyles;
  }

  // Check if the contentTemplate is a string or TemplateRef
  get isStringTemplate(): boolean {
    return typeof this.headerTitleTemplate === 'string';
  }

  get headerTemplate(): TemplateRef<void> {
    return this.headerTitleTemplate as TemplateRef<void>;
  }

  onScroll(event: Event): void {
    this.updateOverflowValue();
  }

  updateOverflowValue() {
    const elemnt = this.widgetsContent.nativeElement;
    const scrollAmount = elemnt.scrollLeft + elemnt.offsetWidth;
    const maxScrollAmount = elemnt.scrollWidth;
    if (elemnt.scrollLeft === 0) {
      this.overflowValue = 'left';
    } else if (scrollAmount === maxScrollAmount) {
      this.overflowValue = 'right';
    } else {
      this.overflowValue = 'both';
    }
  }

  get getScrollAmount(): number {
    if (this.scrollAmount === 'auto') {
      return (
        this.widgetsContent.nativeElement.childNodes[1].offsetLeft -
        this.mainStyles.firstElementLeftMargin
      );
    } else if (this.scrollAmount === 'full') {
      return (
        this.widgetsContent.nativeElement.offsetWidth -
        this.widgetsContent.nativeElement.childNodes[1].offsetLeft
      );
    }
    return this.scrollAmount;
  }

  checkOverflow() {
    if (this.widgetsContent) {
      const element = this.widgetsContent.nativeElement;
      this.hasOverflow =
        element.offsetHeight < element.scrollHeight ||
        element.offsetWidth < element.scrollWidth;
      this.widgetsContent.nativeElement.firstChild.style[
        'margin-left'
      ] = `${this.mainStyles.firstElementLeftMargin}px`;
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.checkOverflow();
  }
}
