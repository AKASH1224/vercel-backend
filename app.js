const express = require("express");
const app = express();
require("dotenv").config();
require("./conn/conn");

const cors = require("cors");
const UserApi = require("./routes/user");
const TaskApi = require("./routes/task");

// Set up middleware first
app.use(cors());
app.use(express.json()); // Ensure JSON parsing for API requests
app.use(express.urlencoded({ extended: true }));

// Then set up routes
app.use("/api/v1", UserApi);
app.use("/api/v2", TaskApi);

// Default route
app.get("/", (req, res) => {
  res.send("Hello from Backend side");
});

const PORT = process.env.PORT || 1000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
// node app
