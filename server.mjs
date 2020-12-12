import express from 'express';
import http from 'http';
import { Server as SocketServer }from 'socket.io';
import words from './words.mjs';

const {
  PORT = 3000,
  ACCESS_CODE = 'geit',
  ADMIN_ACCESS_CODE = 'durebox',
} = process.env;

const app = express();
const server = http.createServer(app);
const socket_server = new SocketServer(server);

let players = {};
let current_word = null;
let current_player = null;
let scoreboard = {};

function award_point(socket) {
  const player = players[socket];
  if(player) {
    scoreboard[player] = (scoreboard[player] || 0) + 1;
  }

  socket_server.to('dash').emit('scoreboard', scoreboard);
  next_round();
}

function next_round() {
  const number_of_players = Object.keys(players).length;
  if (number_of_players == 0) {
    return;
  }
  const player_idx = Math.floor(Math.random() * number_of_players);
  console.log(player_idx);
  const player = Object.entries(players)[player_idx];
  current_player = { id: player[0], name: player[1]}

  current_word = words[Math.floor(Math.random() * words.length)];

  console.log(`Next round ${current_player.name}: ${current_word}`);

  socket_server.to('players').emit('guess', current_player.name);
  socket_server.to(current_player.id).emit('draw', current_word);
}


app.use(express.static('public'));

app.get('/play', (_, res) => {
  res.redirect('/play.html');
})

app.get('/dash', (_, res) => {
  res.redirect('/dash.html');
})

socket_server.on('connection', (socket) => {
  const ip = socket.request.connection.remoteAddress;
  console.log('A client connected');

  socket.on('enroll', ({ name, code }) => {
    if(code !== ACCESS_CODE) {
      socket.emit('error', 'Foute code, porbeer opniew');
      console.log(`User ${name}: ${ip} tried to join the game`);
    } else {
      players[socket.id] = name;

      console.log(`User ${name}: ${ip} joined the game`);
      console.log(players);

      socket.join('players');
      socket.emit('joined');

      socket.to('dash').emit('players', Object.values(players));
    }
  });

  socket.on('enroll_dash', ({ code }) => {
    if(code !== ADMIN_ACCESS_CODE) {
      socket.emit('error', 'Foute code, probeer opniew');
      console.log(`Someone: ${ip} tried to acces the admin pannel with code ${code}`);
    } else {
      console.log(`A user took control of the dahsboard`);
      socket.emit('joined', { players: Object.values(players), words, scoreboard });
      socket.join('dash');
    }
  });
  
  socket.on('wordlist', wordlist => words = wordlist);

  socket.on('toggle', () => {
      next_round();
  });

  socket.on('disconnect', () => {
    delete players[socket.id];
    socket.to('dash').emit('players', Object.values(players));
  });

  socket.on('guess', guess => {
    console.log(guess);
    if(guess.toLowerCase() == current_word) {
      award_point(socket.id);
      socket.emit('win');
    }
  });
});

server.listen(PORT, () => 
  console.log(`Server started on port ${PORT}`)
);
