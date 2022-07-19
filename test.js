const axios = require("axios")

//axios request
async function fetch(url) {
	try {
		const config = {
			headers: {
				"Cliend-Id": "tgdj971595mxhpglihe91xjwcruqol"
			}
		}
		const response = await axios.get(url, config);
		return response.data;
	}
	catch (error) {
		console.log(error);
	}
}


let x = fetch("https://api.twitch.tv/helix/streams?game_id=4")
console.log(x)