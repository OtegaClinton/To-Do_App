require ("dotenv").config();
const express = require("express");
require('./config/database');
const router = require('./router/userRouter')

const app = express();
app.use(express.json());
app.use("/api/v1/",router);

const Port = process.env.PORT || 5050
app.listen(Port,()=>{
    console.log(`server is listening to PORT: ${Port}.`)
});
