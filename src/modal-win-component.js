import { Modal } from './modal-dragging';
import style from './modal-win-component.css';
import { toBoolean, getHeightHiddenEl, debounce } from './utils';

// Custom Element
const tmpl = `
<div class="modal-header">
  <h3 id="modal-title"></h3>
  <div class="modal-btn">
    <div id="modal-max-min">
      <span id="icon-min-max" class="modal-icons"></span>
    </div>
    <div id="close-but" data-close>
      <span id="icon-close" class="modal-icons"></span>
    </div>
  </div>
</div>
<div class="modal-body overflowing-element">
  <slot name="modal-main-content" class="slotted-content"></slot>
</div>
<div class="modal-bottom-divider"></div>
<div class="modal-footer">
  <slot name="modal-footer-content"></slot>
</div>`;

const modalContainerClass = 'modal-container';
const modalHideClass = 'hide';
const modalShowClass = 'active';
const moveableClass = 'moveable';
const stopDragClass = 'stop-drag';
const resizableClass = 'resizable';
const maximizeClass = 'maximize';
const transitionClass = 'modal-transition-all';
const headerModalSelector = '.modal-header';
const modalTitleSelector = '#modal-title';
const maximizeSelector = '#modal-max-min';
const footerModalSelector = '.modal-footer';
const modalBottomDividerSelector = '.modal-bottom-divider';
const hiddenClass = 'modal-element-hidden';
const overlayLinkClass = 'overlay-link';
const overlayBoxClass = 'overlay';

//--- ModalWin class (modal-win custom element)
class ModalWin extends HTMLElement {
  constructor() {
    super();

    const shadow = this.attachShadow({ mode: 'open' });
    const element = document.createElement('div');

    element.classList.add(modalContainerClass);
    element.classList.add(modalHideClass);
    element.innerHTML = tmpl;

    // style
    const styleTag = document.createElement('style');
    styleTag.innerHTML = style;

    shadow.appendChild(styleTag);
    shadow.appendChild(element);

    // overlay
    const overlayEl = document.createElement('a');
    overlayEl.classList.add(overlayLinkClass);
    overlayEl.setAttribute('data-close', '');

    const overlayBox = document.createElement('div');
    overlayBox.classList.add(overlayBoxClass);
    overlayEl.appendChild(overlayBox);
    shadow.appendChild(overlayEl);

    this.element = element;
    this.header = this.element.querySelector(headerModalSelector);
  }

  connectedCallback() {
    if (!this.rendered) {
      this.render();
      this.rendered = true;
    }
  }

  render() {
    this.updateAttributes();

    this.setEvents();

    // drag Modal
    this.modal = new Modal(this, {
      header: this.header,
      isMoveable: toBoolean(this.getAttribute('moveable')),
      stopDragClass,
    });
  }

  updateAttributes() {
    const attributes = ModalWin.observedAttributes;

    // if no attribute, set attribute to true
    attributes.forEach((attribute) => {
      let realAttribute = this.getAttribute(attribute);
      if (!realAttribute && attribute !== 'caption') {
        this.setAttribute(attribute, 'true');
      }
    });
  }

  setEvents() {
    const shadow = this.shadowRoot;
    // close
    shadow.querySelectorAll('[data-close]').forEach((element) => {
      element.addEventListener('click', this.hide.bind(this));
      element.addEventListener('touchstart', this.hide.bind(this));
    });
  }

  static get observedAttributes() {
    return ['caption', 'footer', 'moveable', 'resizable', 'maximize'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) {
      return;
    }

    const methodName = `update${name.charAt(0).toUpperCase()}${name.slice(1)}`;
    if (this[methodName]) {
      if (name !== 'caption') {
        newValue = toBoolean(newValue);
      }

      this[methodName](newValue);
    }
  }

  updateCaption(caption) {
    this.element.querySelector(modalTitleSelector).innerHTML = caption;
  }

  updateFooter(isFooter) {
    const footer = this.element.querySelector(footerModalSelector);
    const bottomDivider = this.element.querySelector(modalBottomDividerSelector);

    if (isFooter) {
      footer.classList.remove(hiddenClass);
      bottomDivider.style.display = 'none';
    } else {
      footer.classList.add(hiddenClass);
      bottomDivider.style.display = 'block';
    }
  }

  updateMoveable(isMoveable) {
    this.isMoveable = isMoveable;
    this.classList[isMoveable ? 'add' : 'remove'](moveableClass);
    this.header.classList[isMoveable ? 'add' : 'remove'](moveableClass);
  }

  updateResizable(isResizable) {
    this.isResizable = isResizable;
    this.classList[isResizable ? 'add' : 'remove'](resizableClass);
  }

  updateMaximize(isMaximize) {
    const maximizeBtn = this.element.querySelector(maximizeSelector);
    maximizeBtn.classList[isMaximize ? 'remove' : 'add'](hiddenClass);

    // max/min event
    if (isMaximize) {
      maximizeBtn.addEventListener('click', this.maximizeRestore.bind(this));
      maximizeBtn.addEventListener('touchstart', this.maximizeRestore.bind(this));
    } else {
      maximizeBtn.removeEventListener('click', this.maximizeRestore.bind(this));
      maximizeBtn.removeEventListener('touchstart', this.maximizeRestore.bind(this));
    }
  }

  show() {
    this.classList.add(modalShowClass);
    this.element.classList.remove(modalHideClass);
    this.element.classList.add(modalShowClass);

    setTimeout(() => {
      this.dispatchEvent(new CustomEvent('opened', { bubbles: true, detail: this }));
      this.modal.center();
    }, 0);
  }

  hide(event) {
    event.stopPropagation();
    event.preventDefault();

    this.classList.add(transitionClass);
    this.element.classList.remove(modalShowClass);
    this.element.classList.add(modalHideClass);
    this.classList.remove(modalShowClass);

    setTimeout(() => {
      this.dispatchEvent(new CustomEvent('closed', { bubbles: true, detail: this }));
      this.classList.remove(transitionClass);
      this.restoreInitModal();
      this.removeAttribute('style');
    }, 400);
  }

  maximizeRestore(event) {
    event.stopPropagation();
    event.preventDefault();

    this.classList.add(transitionClass);
    if (!this.classList.contains(maximizeClass)) {
      this.maximize();
    } else {
      this.restore();
    }
  }

  maximize() {
    const shift = this.modal.scrollShift();
    const rect = this.modal.getOffsetRect();

    this.oldWidth = rect.width;
    this.oldHeight = rect.height;

    this.removeAttribute('style');

    this.style.top = `${shift.top}px`;
    this.style.left = `${shift.left}px`;

    this.classList.add(maximizeClass);
    this.classList.add(stopDragClass);
    this.classList.remove(resizableClass);
    this.header.classList.remove(moveableClass);
    this.header.classList.add(maximizeClass);
  }

  restore() {
    if (!this.oldWidth || !this.oldHeight) {
      return;
    }

    this.modal.center({ w: this.oldWidth, h: this.oldHeight });

    setTimeout(() => {
      this.classList.remove(transitionClass);
      this.restoreInitModal();
    }, 300);
  }

  restoreInitModal() {
    this.classList.remove(maximizeClass);
    this.header.classList.remove(maximizeClass);
    this.classList.remove(stopDragClass);
    if (this.isMoveable) {
      this.header.classList.add(moveableClass);
    }
    if (this.isResizable) {
      this.classList.add(resizableClass);
    }
  }

  toggleContent(elToShow, activeClass) {
    const slotContent = this.querySelector('[slot="modal-main-content"]');
    const elToHide = slotContent.querySelector(`.${activeClass}`);
    if (!elToShow || !activeClass || !elToHide || !slotContent) {
      return false;
    }

    // get new modal height with new content
    const newHeight = this.getNewHeight(elToHide, elToShow);

    // hide element
    elToHide.classList.remove(activeClass);

    // hide slotContent
    slotContent.style.opacity = '0';
    // hide scrolling
    slotContent.style.overflow = 'hidden';

    // animate modal height
    this.classList.add(transitionClass);
    // set new height
    this.style.height = `${newHeight}px`;

    setTimeout(() => {
      slotContent.style.removeProperty('overflow');
      // show slotContent
      slotContent.style.opacity = '1';
      // show element
      elToShow.classList.add(activeClass);
      // remove transition class
      this.classList.remove(transitionClass);
      // animate to vertical center
      this.animateToCenter({ isXCenter: false });
    }, 300);
  }

  visibleAfterScroll(event) {
    event.stopPropagation();
    event.preventDefault();

    const rect = this.modal.getOffsetRect();
    const offsetWin = this.getOffsetWin();

    if (rect.height > offsetWin.bottom - offsetWin.top) {
      return;
    }

    this.classList.add(transitionClass);
    this.classList.add(stopDragClass);

    if (rect.top < offsetWin.top) {
      this.style.top = `${offsetWin.top}px`;
    }

    if (rect.top + rect.height > offsetWin.bottom) {
      let dy =
        offsetWin.bottom - rect.height > offsetWin.top
          ? offsetWin.bottom - rect.height
          : offsetWin.top;
      this.style.top = `${dy}px`;
    }

    if (rect.left < offsetWin.left) {
      this.style.left = `${offsetWin.left}px`;
    }

    if (rect.left + rect.width > offsetWin.right) {
      let dx =
        offsetWin.right - rect.width > offsetWin.left
          ? offsetWin.right - rect.width
          : offsetWin.right;
      this.style.left = `${dx}px`;
    }

    setTimeout(() => {
      this.classList.remove(transitionClass);
      if (!this.classList.contains(maximizeClass)) {
        this.classList.remove(stopDragClass);
      }
    }, 300);
  }

  toCenter(event) {
    event.stopPropagation();
    event.preventDefault();

    this.animateToCenter();
  }

  animateToCenter({ isXCenter = true, isYCenter = true } = {}) {
    this.classList.add(transitionClass);

    this.modal.center({ isXCenter, isYCenter, isSetSize: false });

    setTimeout(() => {
      this.classList.remove(transitionClass);
    }, 300);
  }

  getNewHeight(elToHide, elToShow) {
    const elToHideHeight = elToHide?.offsetHeight || 0;
    const elToShowHeight = getHeightHiddenEl(elToShow);

    return this.offsetHeight - elToHideHeight + elToShowHeight;
  }

  getOffsetWin() {
    const winPageX = window.pageXOffset,
      winPageY = window.pageYOffset,
      screen = this.modal.screenSize();

    return {
      top: winPageY,
      left: winPageX,
      right: winPageX + screen.width,
      bottom: winPageY + screen.height,
    };
  }
}

customElements.define('modal-win', ModalWin);

// window scroll event
const scrollWindow = debounce((event) => {
  const modalWinActive = document.querySelector('modal-win.active');
  if (modalWinActive) {
    modalWinActive.visibleAfterScroll(event);
  }
}, 150);

window.addEventListener('scroll', scrollWindow);

// window resize event
const resizeWindow = debounce((event) => {
  const modalWinActive = document.querySelector('modal-win.active');
  if (modalWinActive) {
    modalWinActive.toCenter(event);
  }
}, 150);

window.addEventListener('resize', resizeWindow);
