const express = require("express")
const fs = require("fs")

let indexfile = 'src/html/index.html'

const app = express()

app.get("/", async(req, res) => {

    let index = fs.readFileSync(indexfile, 'utf8');

    res.end(index)
})

app.get("/timeLate")


app.listen(8080, () => {})