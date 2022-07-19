const express = require("express")
const fs = require("fs")
const axios = require("axios")
const env = require("dotenv")
require("dotenv").config()

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

// wanShowTimes = {start: {day: 1,hour: 16},end: {day: 6,hour: 23}}



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

app.get("/debug", async(req, res) => {
	res.send(await isWanShowLive())
})

app.listen(8000, () => {})


async function isWanShowLive() {
	const config = {
		headers: {
			"Client-Id": process.env.CLIENT_ID,
			"Authorization": "Bearer " + process.env.ACCESS_TOKEN
		}
	}
	let response = "null"
	try {
		response = await axios.get("https://api.twitch.tv/helix/streams?user_login=linustech", config)
	} catch(error) {
		console.log(error)
		return "Invalid Bearer Token"
	}
	return response.data != '{"data":[],"pagination":{}}' ? "offline" : "online"
}
async function getNewAccessToken() {

}