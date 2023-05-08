'use strict';

// prettier-ignore

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

//Planing your project.
//1- User stories. We use user story to map up all the functionalities of the project
//2 we use the user story to implement the features of our application
//3- we use the features data to build a flow-chart
//4-From the flow-chart we build the architecture which simply means how we organize our code and what JavaScript features we will need;
//5- build the application;

//User story: Description of the application functionality from the user's perspective.
//Common format: As a who =[type of user] WHATE-WANT = [AN ACTION] why=[a benefit]

//1- As user , I want to log my running workouts with loaction , distance , time , pace and steps/minute, so I can keep a log of all my running;

//based on this user story we know that the user needs a map where he/she can clicks to add new workout(best way t get location coordinates)
// A flow-chart tell us what the application will do
// Architecture tell us how to implement the what we have on our flow-chart

// Using the geoLocation API; navigator.geolocation.getCurrentPosition();
// we use this function to get the current locatio of the user
//navigator.geolocation.getCurrentPosition() this function take to call back functions the first one is call on success and the second one is call on failurer ;
//How to display a map using a third party library call leaflet

//Project Architecture
///
///////
////////////
class Workout {
  date = new Date();
  id = (Date.now() + '').slice(-10);
  constructor(coords, distance, duration) {
    this.coords = coords;
    this.distance = distance; //in km
    this.duration = duration; //in min
    // this._setDecription();
  }
  _setDecription() {
    //prettier-ignore
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }
}
class Running extends Workout {
  type = 'running';
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calPace();
    this._setDecription();
  }
  calPace() {
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}
class Cyclining extends Workout {
  type = 'cycling';
  constructor(coords, distance, duration, elevation) {
    super(coords, distance, duration);
    this.elevation = elevation;
    this.calSpeed();
    this._setDecription();
  }
  calSpeed() {
    this.speed = this.distance / (this.duration / 60);
    return this.pace;
  }
}

// const running = new Running([236589, 895423], 50, 1.25, 120);
// const cyclining = new Cyclining([236589, 895423], 150, 1.25, 120);
// console.log(running);
// console.log(cyclining);
////////////////
//let map, mapEvent;
class App {
  #eventMap;
  #map;
  #workouts = [];
  #mapZoomLevel = 13;
  constructor() {
    this._getPostion();
    //get data from local storage
    this._getLocalStorage();
    form.addEventListener('submit', this._newWorkout.bind(this));
    inputType.addEventListener('change', this._getElevation.bind(this));
    containerWorkouts.addEventListener('click', this._moveToPopup.bind(this));
    document
      .querySelector('.reset-btn')
      .addEventListener('click', this._reset.bind(this));
    ///
  }
  _getPostion() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        this._loadMape.bind(this),
        function () {
          alert('Unable to get your current loaction');
        }
      );
  }
  _loadMape(position) {
    console.log(position);
    const { latitude, longitude } = position.coords;
    const currentLction = [latitude, longitude];
    //console.log(currentLction);
    this.#map = L.map('map').setView(currentLction, this.#mapZoomLevel);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);
    //Handling clinsks o map;
    this.#map.on('click', this._showForm.bind(this));
    this.#workouts.forEach(work => {
      this._renderWorkoutmarker(work);
    });
  }
  _showForm(event) {
    this.#eventMap = event;
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  _newWorkout(e) {
    e.preventDefault();
    ////
    //helper function
    const validInput = (...inputs) => inputs.every(inp => Number.isFinite(inp));
    const allPositive = (...input) => input.every(ins => ins > 0);
    //Get data from form;
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.#eventMap.latlng;
    let workout;
    // // if workou running, create running object
    // if workout cycling, create cycling object
    // check if data is valid
    if (type === 'running') {
      const cadence = +inputCadence.value;
      console.log(distance);
      // check if data is valid
      if (!validInput(distance, duration, cadence))
        return alert('Not a valid number');
      workout = new Running([lat, lng], distance, duration, cadence);
    }
    if (type === 'cycling') {
      const elevation = +inputElevation.value;
      if (!validInput(distance, duration, elevation))
        return alert('Not a valid number');
      workout = new Cyclining([lat, lng], distance, duration, elevation);
    }
    // Add new object to workout array;
    this.#workouts.push(workout);
    console.log(workout);
    console.log(this.#workouts);
    this._renderWorkoutmarker(workout);
    this._renderWorkout(workout);
    this._hiddeForm();
    ///

    //
    // Set local storage to all workout
    this._setLocalStorage();
    // Render workout on list
    //

    ////
    //clear input fields
  }
  _hiddeForm() {
    inputCadence.value =
      inputDistance.value =
      inputDuration.value =
      inputElevation.value =
        '';
    form.style.display = 'none';
    form.classList.add('hidden');
    setTimeout(() => (form.style.display = 'grid'), 1000);
  }

  _renderWorkoutmarker(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(
        `${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout.description}`
      )
      .openPopup();
  }
  _getElevation() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _renderWorkout(workout) {
    let html = ` <li class="workout workout--${workout.type}" data-id="${
      workout.id
    }">
    <h2 class="workout__title">${workout.description}</h2>
    <div class="workout__details">
      <span class="workout__icon">${
        workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
      }</span>
      <span class="workout__value">${workout.distance}</span>
      <span class="workout__unit">km</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⏱</span>
      <span class="workout__value">${workout.duration}</span>
      <span class="workout__unit">min</span>
    </div>
    `;
    if (workout.type === 'running')
      html += ` 
      <div class="workout__details">
      <span class="workout__icon">⚡️</span>
      <span class="workout__value">${workout.pace.toFixed(1)}</span>
      <span class="workout__unit">min/km</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">🦶🏼</span>
      <span class="workout__value">${workout.cadence}</span>
      <span class="workout__unit">spm</span>
    </div>
      `;

    if (workout.type === 'cycling')
      html += ` 
      <div class="workout__details">
      <span class="workout__icon">⚡️</span>
      <span class="workout__value">${workout.speed.toFixed(1)}</span>
      <span class="workout__unit">km/h</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⛰</span>
      <span class="workout__value">${workout.elevation}</span>
      <span class="workout__unit">m</span>
    </div>
    `;
    form.insertAdjacentHTML('afterend', html);
  }
  _moveToPopup(e) {
    console.log(e.target);
    const workElment = e.target.closest('.workout');
    console.log(workElment);
    if (!workElment) return;

    const workout = this.#workouts.find(
      work => work.id === workElment.dataset.id
    );
    console.log(workout);
    this.#map.setView(workout.coords, this.#mapZoomLevel, {
      animate: true,
      pan: {
        duration: 1,
      },
    });
  }
  // using local storage API
  //local storage is an API that the browser provide for us that we can use for small application to store data
  // we use this method localStorage.setIem() this method takes a key value pair or two argument
  // we can use JSON.stringify() we can pass in any object to this method and it will return a string representation of the object
  _setLocalStorage() {
    const localS = localStorage.setItem(
      'workouts',
      JSON.stringify(this.#workouts)
    );
  }
  // using localStorage.getItem() we use this method along with JSON.parse() to get data from storage convert them back to objects and display them in the UI
  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem('workouts'));
    console.log(data);
    if (!data) return;
    this.#workouts = data;

    this.#workouts.forEach(work => {
      this._renderWorkout(work);
    });
  }
  _reset() {
    localStorage.removeItem('workouts');
    location.reload();
  }
}

const app = new App();
///
///////
////////////
////////////////
const validInputs = (...inputs) => inputs.every(inp => inp > 0);
const arry2 = ['bb', 12, 45, 'dc'];
console.log(validInputs(arry2));

document.querySelector('.reset-btn').addEventListener('click', function () {});
