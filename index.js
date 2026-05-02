const express = require("express");
const app = express();
const PORT = 3001;
const mongoose = require("mongoose");
const ticketRouter = require("./routes/TicketRoutes");

//middleware
app.use(express.json());
app.use("/api/tickets", ticketRouter);

mongoose.connect('mongodb://localhost:27017/taskflowdb?replicaSet=rs0')
  .then(() => console.log('Connected to MongoDB (Replica Set)...'))
  .catch(err => console.error('Could not connect to MongoDB...', err));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
