//--- theme
const storedTheme =
  localStorage.getItem('theme') ||
  (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
if (storedTheme) {
  document.documentElement.setAttribute('data-theme', storedTheme);
}

document.querySelectorAll('#theme-toggle-box span').forEach((element) => {
  const targetTheme = element.dataset.theme;
  if (storedTheme === targetTheme) {
    element.classList.add('active');
  }
  element.addEventListener('click', () => {
    document.documentElement.setAttribute('data-theme', targetTheme);
    document.querySelector('#theme-toggle-box span.active').classList.remove('active');
    element.classList.add('active');
    localStorage.setItem('theme', targetTheme);
  });
});

//--- demo modal-win3 with video
const modalWinVideo = document.querySelector('modal-win#modal-win3');
const videoEl = modalWinVideo.querySelector('video');
const sourceEl = videoEl.querySelector('source');

videoEl.volume = 0;

sourceEl.addEventListener('error', () => {
  console.error('The video could not be loaded, either because the server or network failed');
});

// custom event
// the event 'closed' is fired when the modal window is closing
modalWinVideo.addEventListener('closed', () => {
  if (videoEl) {
    videoEl.pause();
  }
});

// custom event
// the event 'opened' is fired when the modal window is opening
modalWinVideo.addEventListener('opened', () => {
  if (videoEl) {
    videoEl.play();
  }
});

//--- demo #modal-win4 with slider
// slider
class Slider {
  constructor() {
    this.folder = 'img';
    this.images = ['1.jpg', '2.jpg', '3.jpg'];

    this.currentSlide = 0;
    this.lastSlide = this.images.length - 1;

    this.mainContainer = document.querySelector('#modal-win4');
    this.container = this.mainContainer.querySelector('#example-slider');

    this.init();
  }

  init() {
    const list = document.createElement('ul');
    list.setAttribute('id', 'slides');
    this.container.appendChild(list);

    this.images.forEach((element, i) => {
      const li = document.createElement('li');
      li.classList.add('slide');
      if (i === 0) {
        li.classList.add('active');
      }

      const div = document.createElement('div');
      div.style.backgroundImage = `url(${this.folder}/${element})`
      
      li.appendChild(div);
      list.appendChild(li);
    });

    this.container.appendChild(list);

    this.slides = document.querySelectorAll('#slides .slide');

    this.mainContainer
      .querySelector('.preview-icon-control .icon-left')
      .addEventListener('click', this.prev.bind(this));
    this.mainContainer
      .querySelector('.preview-icon-control .icon-right')
      .addEventListener('click', this.next.bind(this));
  }

  hideCurrent() {
    this.slides[this.currentSlide].classList.remove('active');
  }

  showNext() {
    this.slides[this.currentSlide].classList.add('active');
  }

  next() {
    this.hideCurrent();

    if (this.currentSlide < this.lastSlide) {
      this.currentSlide++;
    } else {
      this.currentSlide = 0;
    }

    this.showNext();
  }

  prev() {
    this.hideCurrent();

    if (this.currentSlide > 0) {
      this.currentSlide--;
    } else {
      this.currentSlide = this.lastSlide;
    }

    this.showNext();
  }
}

new Slider();

//--- demo modal-win5 with form
const modalWinForm = document.querySelector('modal-win#modal-win5');

// hide one element and show another in the modal window (modal-win5)
const toggleForm = (elToShow) => {
  const caption = elToShow.querySelector('.form-title').textContent;
  modalWinForm.setAttribute('caption', caption);
  modalWinForm.toggleContent(elToShow, 'active');
};

document.querySelectorAll('.toSignUp').forEach((element) => {
  element.addEventListener('click', (e) => {
    e.preventDefault();
    toggleForm(document.querySelector('.signup-form'));
  });
});

document.querySelectorAll('.toLogin').forEach((element) => {
  element.addEventListener('click', (e) => {
    e.preventDefault();
    toggleForm(document.querySelector('.login-form'));
  });
});

document.querySelector('.toPasswordRecover').addEventListener('click', (e) => {
  e.preventDefault();
  toggleForm(document.querySelector('.password-recover'));
});

// add events any buttons in modal-win
document.querySelectorAll('.btn-box .btn').forEach((element) => {
  element.addEventListener('click', (e) => {
    // do actions depending on the pressed button
    document.querySelector('modal-win.active').hide(e);
  });
});
