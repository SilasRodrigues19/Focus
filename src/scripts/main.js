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
let selectedInterval = '';

const formatTimeToMinutesAndSeconds = (time) => {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;

  const formattedMinutes = minutes.toString().padStart(2, '0');
  const formattedSeconds = seconds.toString().padStart(2, '0');

  return `${formattedMinutes}:${formattedSeconds}`;
};

const formatTimeToMinutesAndSecondsWithText = (time) => {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;

  const formattedMinutes = minutes.toString().padStart(2, '0');
  const formattedSeconds = seconds.toString().padStart(2, '0');

  return seconds === 0
    ? `${formattedMinutes} minutes`
    : `${formattedMinutes} minutes and ${formattedSeconds} seconds`;
};

const setProgress = (time, duration) => {
  const progress = (1 - time / duration) * 100;
  progressElement.style.width = `${progress}%`;
};

const updateInformation = () => {
  const formattedTime = formatTimeToMinutesAndSeconds(time);
  document.title = `${formattedTime} - Focus`;

  const breakTimes = {
    '00:00': '',
    '05:00': 'Short break',
    '10:00': 'Medium break',
    '15:00': 'Long break',
  };

  const dynamicText = selectedInterval
    ? `Performing ${selectedInterval}`
    : 'Choose the break time to focus';
  pageTitle.innerHTML = breakTimes[formattedTime] || dynamicText;
};

const showNotification = (body) => {
  if (!('Notification' in window)) {
    Toastify({
      text: "This browser doesn't support notifications.",
      duration: 3000,
      gravity: 'top',
      position: 'right',
      backgroundColor: 'transparent',
      className: 'custom-toast',
      stopOnFocus: true,
    }).showToast();
  } else {
    Notification.requestPermission()
      .then((permission) => permission === 'granted')
      .then((isGranted) => {
        if (isGranted) {
          const notification = new Notification('Focus Timer', {
            body: body,
            icon: '../../public/coffee.svg',
            vibrate: [200, 100, 200],
          });
        }
      });
  }
};


const startTimer = () => {
  clearInterval(interval);

  setProgress(time, duration);
  timerElement.textContent = formatTimeToMinutesAndSeconds(time);

  interval = setInterval(() => {
    if (!isPaused) {
      time--;
      setProgress(time, duration);
      timerElement.textContent = formatTimeToMinutesAndSeconds(time);

      const notificationTimes = getNotificationTimes(duration);
      if (notificationTimes.includes(time)) {
        showNotification(`${formatTimeToMinutesAndSecondsWithText(time)} left`);
      }

      if (time <= 0) {
        clearInterval(interval);
        progressElement.style.width = '0';
        showNotification('The time is over!');
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
  selectedInterval = '';
};

const getNotificationTimes = (duration) => {
  const interval = 30;
  const notificationTimes = [];
  let remainingTime = duration;

  while (remainingTime > interval) {
    remainingTime -= interval;
    notificationTimes.push(remainingTime);
  }

  return notificationTimes;
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
            text: 'Choose the break time',
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
            text: 'Notification permission granted',
            duration: 3000,
            gravity: 'top',
            position: 'right',
            backgroundColor: 'transparent',
            className: 'custom-toast',
            stopOnFocus: true,
          }).showToast();
        } else {
          Toastify({
            text: 'Notification permission not granted',
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
    timerElement.textContent = formatTimeToMinutesAndSeconds(time);
    selectTime('short');
    selectedInterval = 'Short break';
    updateInformation();
  }
});

mediumTimeButton.addEventListener('click', () => {
  if (!isRunning) {
    duration = mediumTime * 60;
    time = duration;
    timerElement.textContent = formatTimeToMinutesAndSeconds(time);
    selectTime('medium');
    selectedInterval = 'Medium break';
    updateInformation();
  }
});

longTimeButton.addEventListener('click', () => {
  if (!isRunning) {
    duration = longTime * 60;
    time = duration;
    timerElement.textContent = formatTimeToMinutesAndSeconds(time);
    selectTime('long');
    selectedInterval = 'Long break';
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
