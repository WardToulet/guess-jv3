'use strict';
// Use socket.io client injected in html by socket.io server
const socket = io();

// Sections
const section_enroll = document.querySelector('section#enroll');

// Enroll
const form_enroll = document.querySelector('#enroll-form');
const inp_name = document.querySelector('#inp-name');
const inp_code = document.querySelector('#inp-code');

// Dash
const list_players = document.querySelector('#list-players');
const btn_toggle = document.querySelector('#btn-toggle');
const inp_word_list = document.querySelector('#inp-word-list');
const list_scoreboard = document.querySelector('#scoreboard');

function setMode(mode) {
  const mode_section = document.querySelector(`section#${mode}`);
  if(!mode_section) {
    throw `No mode ${mode}`;
  }

  const other_modes = document.querySelectorAll('section');
  other_modes.forEach(mode => mode.classList.add('hidden'));

  mode_section.classList.remove('hidden');
}

form_enroll.addEventListener('submit', handle_enroll);
function handle_enroll(e) {
  e.preventDefault();
  console.log('try enroll');
  socket.emit('enroll_dash', {
    code: inp_code.value,
  });
}

function update_players(players) {
  list_players.innerText = players.join(', ')
}

function update_words(words) {
  inp_word_list.value = words.join('\n');
  inp_word_list.innerText = words.join('\n');
}

function update_score(scoreboard) {
  list_scoreboard.innerHTML = Object.entries(scoreboard).map(([name, score]) => {
    return `<div>${name} - ${score}</div>`
  })
}

btn_toggle.addEventListener('click', handle_toggle);
function handle_toggle() {
  socket.emit('toggle');
}

socket.on('error', console.error);

socket.on('joined', ({ players, words, scoreboard }) => {
  console.log(players, words);
  update_players(players);
  update_score(scoreboard);
  setMode('dash');
});

socket.on('scoreboard', (scoreboard) => {
  update_score(scoreboard);
});

socket.on('players', players => {
  console.log(players);
  update_players(players);
});

socket.on('disconnect', () => {
  setMode('enroll');
});
