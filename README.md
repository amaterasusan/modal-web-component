# Modal window component
**modal-win** is a modern **Vanilla JS** **modal window** web component.  
You can fully configure styles as you want, make the draggable, resizable modal window, etc.

* No dependencies
* Highly customizable
* Easy and simple to use

[![Donate](https://img.shields.io/badge/Donate-PayPal-Brightgreen.svg)](https://www.paypal.com/donate/?hosted_button_id=BS8UDTUXJWYBN)

## How to use it
### 1. Use a file './build/modal-win-component.min.js'
```javascript
// import as an ES module
import 'path/to/modal-win-component.min';
```
Or just include into HTML
```markup
<script src="https://path/to/modal-win-component.min.js"></script>
```

### 2. Create a modal-win container.  
```html
  <modal-win caption="Your caption">
    <div slot="modal-main-content">
      Your html
    </div>

    <div slot="modal-footer-content">
      Your html
    </div>
  </modal-win>
```
Example:
```html
  <modal-win caption="Are you sure?" id="modal-win1" footer="true" moveable="false" maximize="false" resizable="false">
    <div slot="modal-main-content">
      Please confirm removing this item
    </div>

    <div slot="modal-footer-content">
      <div class="btn-box active">
        <button class="btn btn-grey">Сancel</button>
        <button class="btn btn-red">Delete</button>
      </div>
    </div>
  </modal-win>
```

```markup
Attributes: `footer`, `moveable`, `resizable`, `maximize` default to true, 
can be omitted
```

### 3. Styling a modal window 
You can style the inner elements of the modal window using css variables, see examples.

Styles, events of your elements that are in slots, are related to the document, 
so you add them yourself.

Default modal window sizes - width: 500px, height: auto;

To set your sizes:
```markup
modal-win#modal-win1 {
  --main-mw-width: 450px;
  --main-mw-height: 260px;
}
```

To hide the component, if it isn't yet defined, you can do like this:
```markup
modal-win:not(:defined) {
  display: none;
}
```