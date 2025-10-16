const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require("http");
const path = require("path");
const route = require('./routes/indexRoutes');
require('dotenv').config();
const app = express();
const server = http.createServer(app);

// Middleware setup
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.set('view', path.join(__dirname, 'view'));
app.use(express.static("public"));
app.use(bodyParser.json());

const initializeSocket = require("./utils/socket");
const io = initializeSocket(server);

// Use routes
app.use('/api', route);


let port = process.env.PORT || 4001;
server.listen(port, () => {
    console.log("⚡ Node app is running on port 4001");
});