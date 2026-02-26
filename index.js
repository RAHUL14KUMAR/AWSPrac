const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send("AWS Node App Running 🚀");
});

app.listen(3000, () => console.log("Server started"));