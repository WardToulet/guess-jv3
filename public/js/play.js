'use strict';
// Use socket.io client injected in html by socket.io server
const socket = io();

// Sections
const section_enroll = document.querySelector('section#enroll');
const section_draw = document.querySelector('section#draw');
const section_guess = document.querySelector('section#guess');
const section_idle = document.querySelector('section#idle');

// Enroll
const form_enroll = document.querySelector('#enroll-form');
const inp_name = document.querySelector('#inp-name');
const inp_code = document.querySelector('#inp-code');
const txt_word = document.querySelector('#txt-word');
const txt_drawer = document.querySelector('#txt-drawer');

// Guess
const form_guess = document.querySelector('#guess-form');
const inp_guess = document.querySelector('#inp-guess');

function setMode(mode) {
  switch(mode) {
    case 'enroll': {
      section_enroll.classList.remove('hidden')
      section_draw.classList.add('hidden')
      section_guess.classList.add('hidden')
      section_idle.classList.add('hidden')
    } break;
    case 'draw': {
      section_enroll.classList.add('hidden')
      section_draw.classList.remove('hidden')
      section_guess.classList.add('hidden')
      section_idle.classList.add('hidden')
    } break;
    case 'guess': {
      section_enroll.classList.add('hidden')
      section_draw.classList.add('hidden')
      section_guess.classList.remove('hidden')
      section_idle.classList.add('hidden')
    } break;
    case 'idle': {
      section_enroll.classList.add('hidden')
      section_draw.classList.add('hidden')
      section_guess.classList.add('hidden')
      section_idle.classList.remove('hidden')
    } break;
    default: throw `No mode named ${mode}`;
  }
}

form_enroll.addEventListener('submit', handle_enroll);
function handle_enroll(e) {
  e.preventDefault();
  console.log('try enroll');
  socket.emit('enroll', {
    name: inp_name.value,
    code: inp_code.value,
  });
}

form_guess.addEventListener('submit', handle_guess);
function handle_guess(e) {
  e.preventDefault();
  console.log(`Guessing ${inp_guess.value}`);
  socket.emit('guess', inp_guess.value);
  inp_guess.value = '';
}

socket.on('error', console.error);

socket.on('joined', () => setMode('idle'));

socket.on('guess', (player) => {
  setMode('guess');
  txt_drawer.innerText = player || 'anoniem';
  console.log(player);
});

socket.on('draw', (word) => {
  setMode('draw');
  txt_word.innerText = word;
});

socket.on('disconnect', () => {
  setMode('enroll');
});
