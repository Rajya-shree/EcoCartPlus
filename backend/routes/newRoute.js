const express = require("express");
const router = express();
const port = 3000;
application.get ('/hello',(req,res) =>{
    res.send("Hello from newRoute");
})
app.listen(port, () => {
  console.log(`Server is running!`);
  console.log(`To see your 'Hello World', open a web browser and go to:`);
  console.log(`http://localhost:${port}/hello`);
});
