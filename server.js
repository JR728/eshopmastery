const express = require('express');
const routes = require('./routes');
// import sequelize connection
const sequelize = require('./config/connection'); // Update the path as needed

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(routes);

// Sync sequelize models to the database, then turn on the server
sequelize.sync({ force: false }).then(() => { // Set force to true to drop and re-create tables on every app start (useful during development)
  app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}!`);
  });
});