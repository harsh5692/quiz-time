# quiz-time
A Real Time Multiplayer Quiz Application built using Node.js, Express, Mongoose, Socket.io &amp; Passport.

### Installation
	$npm install
	$node server.js

### Game Settings
By defult this game is played between two players and for five rounds.
Change the defaults in file `app/database/schemas/room.js`.

By default each question has an answering time of 10 seconds.
Change this delay(TIME_INTERVAL) in file  `app/socket/index.js` 

### How to play
- Register/Loign into the game.
- Checkout the list of available rooms or create your own.
- Once the room is full, game automatically starts.
- Submit your answers to a simple quiz.
- Every correct answer will gain you 3 points, you loose 1 point for an incorrect answer. No points if no answer provided. You cannot attempt multiple answers for a question.
- When all rounds are completed, auto redirects to room list page.

Have Fun!
