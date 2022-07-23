const express = require("express")
const app = express()

const fs = require("fs")
const axios = require("axios")
const path = require("path")

const env = require("dotenv")
require("dotenv").config()
const port = 8000

let indexfile = 'src/html/index.html'
let dataJsonFile = 'src/data.json'

let wanShowTimes = { //times are in UTC
    start: {
        day: 6,
        hour: 0
    },
    end: {
        day: 6,
        hour: 2
    }
}

let latestStatus = { //cached status
    status: 0,
    recordedAt: 0
}

// wanShowTimes = {start: {day: 1,hour: 16},end: {day: 6,hour: 23}}

app.get("/", async(req, res) => {
    let index = fs.readFileSync(indexfile, 'utf8');
    res.end(index)
})

app.get("/status", async(req, res) => {
    const date = new Date()
    
    if(latestStatus.recordedAt < date.getTime()-10_000) { //caches the state for 10 seconds
        latestStatus = {
            status: await updateStatus(),
            recordedAt: date.getTime()
        }
    }

    res.send(latestStatus.status) //send the cached status
    
})

app.get("/favicon.ico", async(req, res) => {
    res.sendFile(path.resolve("src/html/soontm.png"))
})

app.listen(port, () => { console.log(`Site is live at port ${port}`)})

//check if wan is live on twitch.tv/LinusTech
async function isWanShowLive() {
	const config = {
		headers: {
			"Client-Id": process.env.CLIENT_ID,
			"Authorization": "Bearer " + process.env.ACCESS_TOKEN
		}
	}
	let response
	try {
		response = await axios.get("https://api.twitch.tv/helix/streams?user_login=linustech", config)
	} catch(error) {
		console.log(error)
		return "Invalid Bearer Token"
	}

	return JSON.stringify(response.data) == '{"data":[],"pagination":{}}' ? "offline" : "online"
}

//get a new access token if the current one is dead, they expire after 3 months
async function getNewAccessToken() {
    let response
    try {
        response = await axios.post(`https://id.twitch.tv/oauth2/token?client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}&grant_type=client_credentials`)
    } catch (error) {
        console.log(error)
        return "Error getting ID"
    }
    console.log(response.data.access_token)
    return response.data.access_token
}

//update the status of the website. Runs every 10 seconds at the most
async function updateStatus() {
    const date = new Date()
    let startDate = new Date( Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 24, 0, 0, 0) )
    const dateJson = {"day": date.getUTCDay(), "hour": date.getUTCHours()}
    //check if stream is live
    let response = await isWanShowLive()
    
    //--------------------
    
    if(response == "Invalid Bearer Token") { //get a new key if the current one is dead
        let newToken = await getNewAccessToken()
        process.env.ACCESS_TOKEN = newToken
        response = await isWanShowLive()
    }
    
    // if the stream is live, return the stream link
    if(response == "online") {
        return "live at <a href='https://twitch.tv/LinusTech'>twitch.tv/LinusTech</a>"
    }
        
        //check if its time for wan show
        if(dateJson["day"] >= wanShowTimes["start"]["day"] && dateJson["day"] <= wanShowTimes["end"]["day"]) {
            if(dateJson["hour"] >= wanShowTimes["start"]["hour"] && dateJson["hour"] <= wanShowTimes["end"]["hour"]) {
            
                updateRecordLateTime(parseInt((date - startDate)/1000))
                return "late"
            }
        }
        
        //else say its not time yet
        return "not on yet"
    }
    
async function updateRecordLateTime(lateTime) {
    let data = JSON.parse(fs.readFileSync(dataJsonFile))
    if(data.recordTimeLate < lateTime) {
        data.recordTimeLate = lateTime
        fs.writeFileSync(dataJsonFile, JSON.stringify(data))
    }
}