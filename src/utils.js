/**
 * restrict the frequently calling of function,
 * by delaying the execution of the function until a specified time
 * @param {Function} func
 * @param {Number} wait
 * @param {Boolean} immediate
 * @returns {Function}
 */
export const debounce = (func, wait, immediate) => {
  let timeout;
  return function () {
    const context = this,
      args = arguments;

    const later = function () {
      timeout = null;
      if (!immediate) {
        func.apply(context, args);
      }
    };

    const callNow = immediate && !timeout;

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) {
      func.apply(context, args);
    }
  };
};

// get height of element with display:none
export const getHeightHiddenEl = (el) => {
  const elStyle = window.getComputedStyle(el),
    elDisplay = elStyle.display;

  // if not hidden return normal height
  if (elDisplay !== 'none') {
    return el.offsetHeight;
  }

  let wanted_height = 0;

  el.style.position = 'absolute';
  el.style.visibility = 'hidden';
  el.style.display = 'block';

  wanted_height = el.offsetHeight;

  el.removeAttribute('style');
  return wanted_height;
};

export const toBoolean = (value) => {
  switch (value?.toLowerCase()?.trim()) {
    case 'true':
    case 'yes':
    case '1':
      return true;
    case 'false':
    case 'no':
    case '0':
      return false;
    default:
      return true;
  }
};
