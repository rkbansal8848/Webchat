const cors = require('cors');
const io = require('socket.io')(process.env.PORT || 8000, {
  cors: {
    origin: 'https://chatwebsite-byrkbansal.onrender.com',
    methods: ['GET', 'POST']
  }
});
const users = {};

io.on('connection', socket => {
  socket.on('new-user-joined', ({ name, code }) => {
    // Assign user to the specified group based on the code
    socket.join(code);
    users[socket.id] = { name, code };
    socket.broadcast.to(code).emit('user-joined', name);
  });

  socket.on('send', ({ message, code }) => {
    // Send the message to all users in the same group as the sender
    socket.broadcast.to(code).emit('receive', { message, name: users[socket.id].name });
  });

  socket.on('disconnect', () => {
    if (users[socket.id]) {
      const { name, code } = users[socket.id];
      socket.broadcast.to(code).emit('left', name);
      delete users[socket.id];
    }
  });
});