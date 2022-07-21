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

    let response = await isWanShowLive()

    if(response == "Invalid Bearer Token") {
        let newToken = await getNewAccessToken()
        process.env.ACCESS_TOKEN = newToken
        response = await isWanShowLive()
    }

    console.log(response)

    if(response == "online") {
        res.send("live at <a href='https://twitch.tv/LinusTech'>twitch.tv/LinusTech</a>")
        return
    }


    //check if its time for wan show
    if(dateJson["day"] >= wanShowTimes["start"]["day"] && dateJson["hour"] >= wanShowTimes["start"]["hour"]) {
        if(dateJson["day"] >= wanShowTimes["end"]["day"] && dateJson["hour"] <= wanShowTimes["end"]["hour"]) {
            res.send("late")
            return
        }
    }

    //else say its not time yet
    res.send("not on yet")
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
		// console.log(error)
		return "Invalid Bearer Token"
	}

    // if(response.response.data.status == 401) {
    //     return "Invalid Bearer Token"
    // }

	return JSON.stringify(response.data) == '{"data":[],"pagination":{}}' ? "offline" : "online"
}
async function getNewAccessToken() {
    const config = {}
    let response
    try {
        response = await axios.post(`https://id.twitch.tv/oauth2/token?client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}&grant_type=client_credentials`)
    } catch (error) {
        console.log(error)
        return "Error getting ID"
    }
    return response.data.access_token
}