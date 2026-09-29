import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "../src/views"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  express.static(path.join(__dirname, "../public"))
);

app.get("/", (req, res) => {
  res.render("home");
});


app.get("/login",(req,res)=>{
    res.render("login",{
        title:"Login"
    })
})


export  {app};