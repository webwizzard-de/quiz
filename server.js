
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const questions = JSON.parse(fs.readFileSync('./questions.json', 'utf-8'));
let players = {};

app.use(express.static('public'));

app.get('/questions', (req, res) => res.json(questions));

io.on('connection', socket => {
  socket.on('join', name => {
    players[socket.id] = { name, score: 0 };
  });

  socket.on('answer', ({ name, answer }) => {
    const player = players[socket.id];
    const correct = questions[currentQuestionIndex].correct;
    if (answer === correct) player.score += 1;
  });

  socket.on('new-question', q => {
    currentQuestionIndex = questions.findIndex(el => el.question === q.question);
    io.emit('question', q);
  });

  socket.on('end', () => {
    const leaderboard = Object.values(players).sort((a, b) => b.score - a.score);
    io.emit('update-leaderboard', leaderboard);
  });

  socket.on('disconnect', () => {
    delete players[socket.id];
  });
});

server.listen(process.env.PORT || 3000);
