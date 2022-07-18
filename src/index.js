const express = require("express")
const fs = require("fs")

let indexfile = 'src/html/index.html'
let wanShowTimes = {
    start: {
        day: 6,
        hour: 0
    },
    end: {
        day: 6,
        hour: 2
    }
}

wanShowTimes = {start: {day: 0,hour: 0},end: {day: 6,hour: 23}}



const app = express()

app.get("/", async(req, res) => {

    let index = fs.readFileSync(indexfile, 'utf8');

    res.end(index)
})

app.get("/status", async(req, res) => {
    const date = new Date()
    const dateJson = {"day": date.getUTCDay(), "hour": date.getUTCHours()}

    //check if stream is live


    //check if its time for wan show
    if(dateJson["day"] >= wanShowTimes["start"]["day"] && dateJson["hour"] >= wanShowTimes["start"]["hour"]) {
        if(dateJson["day"] <= wanShowTimes["end"]["day"] && dateJson["hour"] <= wanShowTimes["end"]["hour"]) {
            res.send("late")
            return
        }
    }

    //else say its not time yet
    res.send("not on yet")
})


app.listen(8000, () => {})