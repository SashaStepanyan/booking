import {Component, OnInit, ViewChild,Injectable} from '@angular/core';
import {FormControl} from '@angular/forms';

import {NgbDate, NgbCalendar,NgbDatepickerI18n, NgbDateStruct, NgbPopover} from '@ng-bootstrap/ng-bootstrap';
import {MatAutocompleteTrigger} from '@angular/material';
import {Directive, ElementRef, HostListener} from '@angular/core';

@Directive({
  selector: '[OnlyNumber]'
})
export class OnlyNumber {

  // Allow decimal numbers. The \. is only allowed once to occur
  private regex: RegExp = new RegExp(/^[0-9]+(\.[0-9]*){0,1}$/g);

  // Allow key codes for special events. Reflect :
  // Backspace, tab, end, home
  private specialKeys: Array<string> = ['Backspace', 'Tab', 'End', 'Home'];

  constructor(private el: ElementRef) {
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    // Allow Backspace, tab, end, and home keys
    if (this.specialKeys.indexOf(event.key) !== -1) {
      return;
    }

    // Do not use event.keycode this is deprecated.
    // See: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode
    let current: string = this.el.nativeElement.value;
    // We need this because the current value on the DOM element
    // is not yet updated with the value from this event
    let next: string = current.concat(event.key);
    if (next && !String(next).match(this.regex)) {
      event.preventDefault();
    }
  }
}

const I18N_VALUES = {
  'hebrew': {
    weekdays: ["א'", "ב'", "ג'","ד'","ה'", "ו'","ש'"],
    months: ["ינואר", "פברואר","מרץ","אפריל", "מאי", "יוני", "יולי", "אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר"],
  }
  // other languages you would support
};
@Injectable()
export class I18n {
  language = 'hebrew';
}
@Injectable()
export class CustomDatepickerI18n extends NgbDatepickerI18n {

  constructor(private _i18n: I18n) {
    super();
  }

  getWeekdayShortName(weekday: number): string {
    return I18N_VALUES[this._i18n.language].weekdays[weekday - 1];
  }
  getMonthShortName(month: number): string {
    return I18N_VALUES[this._i18n.language].months[month - 1];
  }
  getMonthFullName(month: number): string {
    return this.getMonthShortName(month);
  }

  getDayAriaLabel(date: NgbDateStruct): string {
    return `${date.day}-${date.month}-${date.year}`;
  }
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  providers: [I18n, {provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n}]
})
export class HomeComponent implements OnInit {

  myControl = new FormControl();
  options = [
    'BCN | ברצלונה' ,
    'BRU | בריסל, בלגיה',
    'LON | לונדון',
    'NYC | ניו יורק, ניו יורק ארה״ב',
    'LAX | לוס אנג׳לס, ארה״ב',
    'BCN | ברצלונה',
    'BRU | בריסל, בלגיה',
    'LON | לונדון',
    'NYC | ניו יורק, ניו יורק ארה״ב',
    'LAX | לוס אנג׳לס, ארה״ב'

];

  popover_rooms_count = null
  popover_adults_count = null
  popover_children_count = null
  plusIcon = "+"
  mobile = false

    @ViewChild(MatAutocompleteTrigger) autocomplete: MatAutocompleteTrigger;
    @ViewChild('calendarP') popover: NgbPopover;
    @ViewChild('calendarTrigger') calendarTrigger: ElementRef;

  filteredOptions = [];
  hoveredDate: NgbDate;

  fromDate: NgbDate;
  toDate: NgbDate;
  fromMonth;
  toMonth;
  fromDay;
  toDay;
  constructor(private calendar: NgbCalendar) {
    this.fromDate = calendar.getToday();
    this.toDate = calendar.getNext(calendar.getToday(), 'd', 8);
  }

  ngOnInit() {
      if (window.screen.width === 360) { // 768px portrait
        this.calendarTrigger.nativeElement.style.display = "none"
      }

      this.autocomplete.closePanel();
    this.fromMonth =I18N_VALUES['hebrew']['months'][this.fromDate['month']-1];
    this.fromDay =this.fromDate['day'];
    this.toMonth =I18N_VALUES['hebrew']['months'][this.toDate['month']-1];
    this.toDay =this.toDate['day']

  }

  public _filter(value){
    if (!value) {
      return
    }
    else{
      this.filteredOptions = [];
      const filterValue = value.toLowerCase();

      for (let i = 0; i < this.options.length; i++) {
        if (this.options[i].toLowerCase().indexOf(filterValue) !== -1) {
          this.filteredOptions.push(this.options[i]);
        }
      }
    }
  }

  inpClick(event,autoCompInp){
    console.log("99999")
    var textLength = autoCompInp.value.length;
    if (textLength < 16) {
      autoCompInp.style.fontSize = 2.375 + "rem";
    }

    if (textLength > 16) {
      autoCompInp.style.fontSize = 2 + "rem";
    }
    if (textLength > 18) {
      autoCompInp.style.fontSize = 1.8 + "rem";
    }
    if (textLength > 20) {
      autoCompInp.style.fontSize = 1.6 + "rem";
    }
  }

  selectedOption(event,autoCompInp){
   this.inpClick(event,autoCompInp)
  }


  onDateSelection(date: NgbDate) {
    document.getElementById('myDates').classList.add('active1');
    if (!this.fromDate && !this.toDate) {
      this.fromDate = date;
    } else if (this.fromDate && !this.toDate && date.after(this.fromDate)) {
      this.toDate = date;
    } else {
      this.toDate = null;
      this.fromDate = date;
    }
    if(this.toDate){
      this.toMonth =I18N_VALUES['hebrew']['months'][this.toDate['month']-1];
      this.toDay =this.toDate['day']
    }
    if(this.fromDate){
      this.fromMonth =I18N_VALUES['hebrew']['months'][this.fromDate['month']-1];
      this.fromDay =this.fromDate['day'];
    }
  }

  isHovered(date: NgbDate) {
    return this.fromDate && !this.toDate && this.hoveredDate && date.after(this.fromDate) && date.before(this.hoveredDate);
  }

  isInside(date: NgbDate) {
    return date.after(this.fromDate) && date.before(this.toDate);
  }

  isRange(date: NgbDate) {
    return date.equals(this.fromDate) || date.equals(this.toDate) || this.isInside(date) || this.isHovered(date);
  }
  isStartDate(date: NgbDate) {
    return date.equals(this.fromDate)
  }
  isEndDate(date: NgbDate) {
    return date.equals(this.toDate)
  }
  clearDates() {
    this.fromDate = this.calendar.getToday();
    this.toDate = this.calendar.getNext(this.calendar.getToday(), 'd', 8);
    if(this.toDate){
      this.toMonth =I18N_VALUES['hebrew']['months'][this.toDate['month']-1];
      this.toDay =this.toDate['day']
    }
    if(this.fromDate){
      this.fromMonth =I18N_VALUES['hebrew']['months'][this.fromDate['month']-1];
      this.fromDay =this.fromDate['day'];
    }
    document.getElementById('myDates').classList.remove('active1');
  }
  applyDates() {
    console.log(this.toDate, this.fromDate);
    console.log(this.popover)
    this.popover.close()
  }

  changePopoverRoomCount(){

    if (this.popover_rooms_count==undefined) {
      this.popover_rooms_count = 0
    }
  }
  changePopoverGuestsCount(){
    if (this.popover_adults_count == undefined) {
      this.popover_adults_count = 0
    }
    if (this.popover_children_count == undefined) {
      this.popover_children_count = 0
    }
  }

  increaseRooms(){
    this.popover_rooms_count++
  }
  decreaseRooms(){
    if (this.popover_rooms_count<=0 || !this.popover_rooms_count){
      return
    }
     else{
      this.popover_rooms_count--
    }
  }
  increaseAdults(){
    this.popover_adults_count++
  }
  decreaseAdults(){
    if (this.popover_adults_count<=0 || !this.popover_adults_count){
      return
    }
    else{
      this.popover_adults_count--
    }
  }
  increaseChildren(){
    this.popover_children_count++
  }
  decreaseChildren(){
    if (this.popover_children_count<=0 || !this.popover_children_count){
      return
    }
    else{
      this.popover_children_count--
    }
  }
  recordShown(type){
    if(type=='rooms'){

      document.getElementById('roomsBox').classList.add("active_elem");

      document.getElementById('search-arrow-down-room').classList.add("active");
      document.getElementById('roomsGuests').classList.add('d-none');

    }
    if(type=='calendar'){
      document.getElementById('myDates').classList.add('active');
      document.getElementById('myDates').classList.add('active1');
    }
    if(type=='adults'){
      document.getElementById('guestsBox').classList.add("active_elem");
      document.getElementById('plusDiv').classList.remove('hidden');
      document.getElementById('search-arrow-down-children').classList.add('active');
      document.getElementById('guests_value').classList.add('guests_value_active');
      document.getElementById('labelGuests').classList.add('d-none');

    }
  }
  recordHidden(type){
    if(type=='rooms'){

      document.getElementById('search-arrow-down-room').classList.remove("active");
    }
    if(type=='calendar'){


      document.getElementById('myDates').classList.remove('active');
    }
    if(type=='adults'){


      document.getElementById('search-arrow-down-children').classList.remove('active');
   //   if(!this.popover_adults_count  && !this.popover_children_count) {

      //  document.getElementById('guests_value').classList.remove('guests_value_active');
    //  }
    }
  }
}
