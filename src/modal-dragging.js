// --- Dragging
class Dragging {
  constructor(el, options) {
    this.element = typeof el === 'string' ? document.querySelector(el) : el;

    if (!(this.element instanceof HTMLElement)) {
      throw new Error('`element` is not HTMLElement!');
    }

    this.options = options || {};
    this.stopDragClass = this.options.stopDragClass ?? '';
  }

  start(event) {
    if (this.element.classList.contains(this.stopDragClass)) {
      this.dragging = false;
      return false;
    }

    event.stopPropagation();
    event.preventDefault();

    // is left mouse down
    let isLeftButton =
      (event.which ? event.which == 1 : false) || (event.button ? event.button == 1 : false);

    // has touch event
    this.hasTouch = event.type === 'touchstart';
    let touches;

    if (this.hasTouch) {
      touches = this.getTouches(event);
    }
    this.hasTouch = this.hasTouch && touches;

    if (!isLeftButton && !this.hasTouch) {
      return false;
    }

    // set this maxX, maxY
    this.getMax();

    // set start position
    this.startPos = this.hasTouch ? this.eventTouchPosition(touches) : this.eventPosition(event);

    // element left, top, width, height
    this.rect = this.getOffsetRect();

    document.body.addEventListener('mousemove', this.move.bind(this));
    document.body.addEventListener('touchmove', this.move.bind(this));

    document.documentElement.addEventListener('mouseup', this.end.bind(this));
    document.documentElement.addEventListener('touchend', this.end.bind(this));

    this.dragging = true;
  }

  move(event) {
    if (!this.dragging) {
      return false;
    }

    event.stopPropagation();

    if (!this.hasTouch) {
      event.preventDefault();
    }

    let touches;
    if (this.hasTouch) {
      touches = this.getTouches(event);
    }

    let pos = this.hasTouch ? this.eventTouchPosition(touches) : this.eventPosition(event);

    this.setCoords(event, pos);
  }

  end(event) {
    if (!this.dragging) {
      return false;
    }

    event.stopPropagation();
    event.preventDefault();

    document.body.removeEventListener('mousemove', this.move.bind(this));
    document.body.removeEventListener('touchmove', this.move.bind(this));
    document.body.removeEventListener('mouseup', this.end.bind(this));
    document.body.removeEventListener('touchend', this.end.bind(this));

    this.dragging = false;
  }

  eventPosition(event) {
    let pageX = event.pageX;
    let pageY = event.pageY;

    if (pageX === undefined) {
      pageX = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
      pageY = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }
    return {
      x: pageX,
      y: pageY,
    };
  }

  getTouches(event) {
    return event.changedTouches[0]
      ? event.changedTouches[0]
      : event.originalEvent && event.originalEvent.changedTouches[0]
      ? event.originalEvent.changedTouches[0]
      : null;
  }

  eventTouchPosition(touch) {
    const winPageX = window.pageXOffset,
      winPageY = window.pageYOffset;

    let x = touch.clientX,
      y = touch.clientY;

    if (
      (touch.pageY === 0 && Math.floor(y) > Math.floor(touch.pageY)) ||
      (touch.pageX === 0 && Math.floor(x) > Math.floor(touch.pageX))
    ) {
      x = x - winPageX;
      y = y - winPageY;
    } else if (y < touch.pageY - winPageY || x < touch.pageX - winPageX) {
      x = touch.pageX - winPageX;
      y = touch.pageY - winPageY;
    }

    return {
      x,
      y,
    };
  }

  setCoords(event, pos) {
    if (!event) return;

    const shift = this.scrollShift(),
      dx = this.startPos.x - pos.x,
      dy = this.startPos.y - pos.y;

    let left = this.rect.left - dx,
      top = this.rect.top - dy;

    // left
    if (dx < 0 && left + this.rect.width > this.maxX) {
      left = this.maxX - this.rect.width;
    }

    if (dx > 0 && left < 0) {
      left = 0;
    }

    if (left < shift.left) {
      left = shift.left;
    }

    // top
    if (dy < 0 && top + this.rect.height > this.maxY) {
      top = this.maxY - this.rect.height;
    }

    if (dy > 0 && top < 0) {
      top = 0;
    }

    if (top < shift.top) {
      top = shift.top;
    }

    this.element.style.left = `${left}px`;
    this.element.style.top = `${top}px`;
  }

  getMax() {
    const screen = this.screenSize(),
      shift = this.scrollShift();

    this.maxX = screen.width + shift.left;
    this.maxY = screen.height + shift.top;
  }

  getOffsetRect() {
    const rect = this.element.getBoundingClientRect(),
      shift = this.scrollShift();
    
    return {
      left: rect.left + shift.left,
      top: rect.top + shift.top,
      width: this.element.offsetWidth,
      height: this.element.offsetHeight,
    };
  }

  scrollShift() {
    return {
      left: document.documentElement.scrollLeft || window.scrollX,
      top: document.documentElement.scrollTop || window.scrollY,
    };
  }

  screenSize() {
    return {
      width: document.documentElement.clientWidth,
      height: document.documentElement.clientHeight,
    };
  }
}

//--- Modal window
export class Modal extends Dragging {
  constructor(el, options) {
    super(el, options);

    this.header = !this.options.header
      ? this.element
      : typeof this.options.header === 'string'
      ? this.element.querySelector(this.options.header)
      : this.options.header;

    if (!(this.header instanceof HTMLElement)) {
      throw new Error('`header` is not HTMLElement!');
    }

    this.isMoveable = options.isMoveable ?? true;

    this.attach();
  }

  attach() {
    this.dragging = false;

    if (this.isMoveable) {
      this.header.addEventListener('mousedown', this.start.bind(this));
      this.header.addEventListener('touchstart', this.start.bind(this));
    }
  }

  center({ isXCenter = true, isYCenter = true, w, h, isSetSize = true } = {}) {
    const screen = this.screenSize();
    const rect = this.getOffsetRect();
    const shift = this.scrollShift();
    let width = w || rect.width;
    let height = h || rect.height;

    if (width > screen.width) {
      width = screen.width;
    }

    let elTop = parseFloat(screen.height / 2 - height / 2) + shift.top;
    let elLeft = parseFloat(screen.width / 2 - width / 2) + shift.left;

    if (elTop < 0) {
      elTop = 0;
    }

    if (elLeft < 0) {
      elLeft = 0;
    }

    if (isYCenter) {
      this.element.style.top = `${elTop}px`;
    }

    if (isXCenter) {
      this.element.style.left = `${elLeft}px`;
    }

    if (isSetSize) {
      this.element.style.width = `${width}px`;
      this.element.style.height = `${height}px`;
    }
  }
}
