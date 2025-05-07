# easy-datetime-picker

A simple, lightweight, dependency-free **Date & Time Picker** built in vanilla JavaScript and CSS.  
Designed to be **easy to use**, **highly customizable**, and **visually clean**, it replaces the default browser UI with a modern, consistent picker experience. View a demo of how it works <a href="https://thhamiltonsmith.github.io/easy-datetime-picker/demo/">here.</a>

---

## Why This Picker?

The native HTML date/time inputs vary wildly in style and behaviour across browsers, and often do not meet modern design or accessibility expectations.  
`easy-datetime-picker` gives you a uniform, easy-to-style, and fully configurable picker with **zero dependencies**.

---

## Features

- **Date Picker**: Select single dates, with min/max ranges, disable specific weekdays or weekends, default to today, and optionally disallow today.
- **Time Picker**: 12 h (AM/PM) or 24 h formats, configurable intervals, min/max times, and disallow past times.
- **Linked Pickers**: Link a time picker to a date picker (`data-linked-to`), and link start/end ranges for both date and time.
- **Range Selection**: Choose start/end dates or start/end times in one interface, with invalid values automatically disabled.
- **Responsive Positioning**: Auto-positions above/below the button to stay within viewport.

---

## Installation

1. Include the CSS and JS in your HTML:

```html
   <link rel="stylesheet" href="date-picker.css" />
   <script src="date-picker.js" defer></script>
```

Most of the css can be modified to suit your needs, although changing class names and changing the div structure will most likely break things. Changing the colours though and basic styling should be mostly harmless.

2. Add any element with class `picker-button` and the appropriate `data-` attributes.

3. Add the required picker backdrop and elements somewhere in your DOM on pages where it is needed. This will auto-populate based on the properties of your date/time buttons when they are clicked.

```html
<!-- Shared picker dropdowns -->
<div id="picker-backdrop" class="picker-backdrop"></div>
<div id="date-picker" class="date-picker">
    <div class="date-picker-header">
        <div class="days-of-week">
            <span>M</span><span>T</span><span>W</span>
            <span>T</span><span>F</span><span>S</span><span>S</span>
        </div>
    </div>
    <div id="date-picker-months" class="date-picker-months"></div>
</div>
<div id="time-picker" class="time-picker"></div>
```
---

## Basic Examples

Here are some basic HTML examples of date and time picker buttons. You can customise them using various supported data properties, which can be found below.

### 1. Standalone Date Picker

```html
<div class="picker-button"
     data-picker-type="date"
     data-days-back="0"
     data-days-forward="365">
  <span class="picker-value">Select Date</span>
</div>
```

### 2. Standalone Time Picker

```html
<div class="picker-button"
     data-picker-type="time"
     data-time-interval="15"
     data-start-time="09:00"
     data-end-time="17:00"
     data-24hour="true">
  <span class="picker-value">Select Time</span>
</div>
```

### 3. Linked Date + Time

```html
<div class="picker-button" id="my-date"
     data-picker-type="date"
     data-days-back="0"
     data-days-forward="30"
     data-default-today="true">
  <span class="picker-value">Select Date</span>
</div>
<div class="picker-button"
     data-picker-type="time"
     data-linked-to="my-date"
     data-time-interval="30"
     data-start-time="08:00"
     data-end-time="18:00"
     data-allow-past-times="false">
  <span class="picker-value">Select Time</span>
</div>
```

---

## Supported `data-` Attributes

There are multiple supported data attributes that can and should be used to allow different types of functioanlity. some of them such as `'data-picker-type'` and `'data-value'` are required, while others are optional, but will of course provide varying functionality:

#### Common
- **`data-picker-type="date" | "time"`**  
  Specifies whether this button opens the date picker or time picker.

- **`data-value`**  
  Auto-populated to store the selected date (`D-M-YYYY`) or time (`HHMM`).

#### Date Picker
- **`data-days-back="N"`**  
  Number of days before today that can be selected.

- **`data-days-forward="N"`**  
  Number of days after today that can be selected.

- **`data-default-today="true|false"`**  
  Auto-select today’s date when the picker first opens.

- **`data-allow-today="true|false"`**  
  Allow or disallow selecting today explicitly.

- **`data-disable-weekends="true|false"`**  
  Disable selection of Saturdays (`6`) and Sundays (`0`).

- **`data-disable-weekdays="0,1,2,..."`**  
  Disable specific weekdays (0=Sun, 1=Mon, …).

##### Range Mode
- **`data-range-group="groupName"`**  
  Identifier to link two date pickers as a start/end range.

- **`data-range="start" | "end"`**  
  Marks this picker as the start or end in a date range.

#### Time Picker
- **`data-time-interval="minutes"`**  
  Time slot increment in minutes (e.g. `5`, `15`, `30`).

- **`data-start-time="HH:MM"`**  
  Earliest selectable time.

- **`data-end-time="HH:MM"`**  
  Latest selectable time.

- **`data-24hour="true|false"`**  
  Display times in 24-hour format if `true`, otherwise use AM/PM.

- **`data-allow-past-times="true|false"`**  
  Disable times that have already passed on the current date.

##### Linked Mode
- **`data-linked-to="dateButtonId"`**  
  The `id` of the date picker button this time picker is linked to.

- **`data-range-group="groupName"`**  
  Identifier to link two time pickers as a start/end range.

- **`data-range="start" | "end"`**  
  Marks this picker as the start or end in a time range.


---

## Contributing

For any suggestions or improvements, please feel free to **open an issue** or **submit a pull request** on GitHub!
