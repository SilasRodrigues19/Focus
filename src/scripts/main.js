const shortTime = 5;
const mediumTime = 10;
const longTime = 15;

const timerElement = document.querySelector('#timer');
const playPauseButton = document.querySelector('#playPauseButton');
const stopButton = document.querySelector('#stopButton');
const shortTimeButton = document.querySelector('#shortTimeButton');
const mediumTimeButton = document.querySelector('#mediumTimeButton');
const longTimeButton = document.querySelector('#longTimeButton');
const progressBar = document.querySelector('.progress-bar');
const progressElement = document.querySelector('#progress');
const pageTitle = document.querySelector('#pageTitle');

let time = 0;
let duration = 0;
let interval;
let isPaused = false;
let isRunning = false;
let selectedTime = null;

const formatTime = (time) => {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;

  const formattedMinutes = minutes.toString().padStart(2, '0');
  const formattedSeconds = seconds.toString().padStart(2, '0');

  return `${formattedMinutes}:${formattedSeconds}`;
};

const setProgress = (time, duration) => {
  const progress = (1 - time / duration) * 100;
  progressElement.style.width = `${progress}%`;
};

const updateInformation = () => {
  const formattedTime = formatTime(time);
  document.title = `${formattedTime} - Focus`;

  const breakTimes = {
    '00:00': '',
    '05:00': 'Short break',
    '10:00': 'Medium break',
    '15:00': 'Long break',
  };

  pageTitle.innerHTML = breakTimes[formattedTime] || '';
};

const startTimer = () => {
  clearInterval(interval);

  setProgress(time, duration);
  timerElement.textContent = formatTime(time);

  interval = setInterval(() => {
    if (!isPaused) {
      time--;
      setProgress(time, duration);
      timerElement.textContent = formatTime(time);

      if (time <= 0) {
        clearInterval(interval);
        progressElement.style.width = '0';
        showNotification('O tempo acabou!');
        stopTimer();
      }
    }
    updateInformation();
  }, 1000);
};

const pauseTimer = () => {
  isPaused = true;
  playPauseButton.textContent = 'Resume';
};

const resumeTimer = () => {
  isPaused = false;
  playPauseButton.textContent = 'Pause';
};

const stopTimer = () => {
  clearInterval(interval);
  progressElement.style.width = '0';
  timerElement.textContent = '00:00';
  playPauseButton.textContent = 'Play';
  isPaused = false;
  isRunning = false;
  enableButtons();
  selectedTime = null;
  time = 0;
  selectTime('not chosen');
};

const showNotification = (body) => {
  if (!('Notification' in window)) {
    alert('Este navegador não suporta notificações.');
  } else if (Notification.permission === 'granted') {
    const notification = new Notification('Focus Timer', {
      body: body,
    });
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(function (permission) {
      if (permission === 'granted') {
        const notification = new Notification('Focus Timer', {
          body: body,
        });
      }
    });
  }
};

let isTimingToastActive = false;

playPauseButton.addEventListener('click', () => {
  if (!isRunning) {
    switch (selectedTime) {
      case 'short':
        duration = shortTime * 60;
        break;
      case 'medium':
        duration = mediumTime * 60;
        break;
      case 'long':
        duration = longTime * 60;
        break;
      default:
        animateButton();
        if (!isTimingToastActive) {
          Toastify({
            text: 'Selecione o tempo desejado',
            duration: 3000,
            gravity: 'top',
            position: 'right',
            backgroundColor: 'transparent',
            className: 'custom-toast',
            stopOnFocus: true,
          }).showToast();
          isTimingToastActive = true;
        }
        return;
    }

    if (Notification.permission !== 'granted') {
      playPauseButton.textContent = 'Requesting Permission...';
      Notification.requestPermission().then((permission) => {
        playPauseButton.textContent = 'Pause';
        time = duration;
        startTimer();
        isRunning = true;
        disableButtons();
        if (permission === 'granted') {
          Toastify({
            text: 'Permissão de notificação concedida',
            duration: 3000,
            gravity: 'top',
            position: 'right',
            backgroundColor: 'transparent',
            className: 'custom-toast',
            stopOnFocus: true,
          }).showToast();
        } else {
          Toastify({
            text: 'Permissão de notificação não concedida',
            duration: 3000,
            gravity: 'top',
            position: 'right',
            backgroundColor: 'transparent',
            className: 'custom-toast',
            stopOnFocus: true,
          }).showToast();
        }
      });
    } else {
      time = duration;
      startTimer();
      isRunning = true;
      playPauseButton.textContent = 'Pause';
      disableButtons();
    }
  } else {
    if (!isPaused) {
      pauseTimer();
    } else {
      resumeTimer();
    }
  }
});

const animateButton = () => {
  shortTimeButton.classList.add('animate');
  mediumTimeButton.classList.add('animate');
  longTimeButton.classList.add('animate');
  setTimeout(() => {
    shortTimeButton.classList.remove('animate');
    mediumTimeButton.classList.remove('animate');
    longTimeButton.classList.remove('animate');
  }, 1000);
};

shortTimeButton.addEventListener('click', () => {
  if (!isRunning) {
    duration = shortTime * 60;
    time = duration;
    timerElement.textContent = formatTime(time);
    selectTime('short');
    updateInformation();
  }
});

mediumTimeButton.addEventListener('click', () => {
  if (!isRunning) {
    duration = mediumTime * 60;
    time = duration;
    timerElement.textContent = formatTime(time);
    selectTime('medium');
    updateInformation();
  }
});

longTimeButton.addEventListener('click', () => {
  if (!isRunning) {
    duration = longTime * 60;
    time = duration;
    timerElement.textContent = formatTime(time);
    selectTime('long');
    updateInformation();
  }
});

const selectTime = (time) => {
  selectedTime = time;

  ['short', 'medium', 'long'].includes(time)
    ? (progressBar.style.display = 'block')
    : (progressBar.style.display = 'none');
};

const disableButtons = () => {
  shortTimeButton.disabled = true;
  mediumTimeButton.disabled = true;
  longTimeButton.disabled = true;
};

const enableButtons = () => {
  shortTimeButton.disabled = false;
  mediumTimeButton.disabled = false;
  longTimeButton.disabled = false;
};

stopButton.addEventListener('click', () => {
  stopTimer();
  updateInformation();
});
