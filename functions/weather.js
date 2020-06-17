// @ts-check
const fetch = require('node-fetch').default;

async function getWeather(city) {
    const weather =  await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${process.env.WEATHER_KEY}`).then((res) => res.json());
    return weather;
}

exports.handler = async function(event, context, callback) {
    const weather = await getWeather('waterloo, ca');

    function display(body) {
        return `The weather is ${body.main.temp} in ${body.name}`
    }

    const res = await fetch(`https://slack.com/api/chat.postMessage`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${process.env.TOKEN}`,
            'Content-Type': 'application/json'
          }, 
        body: JSON.stringify({
            channel: "CEPE43JQ0",
            blocks: [
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": `:sunny: ${display(weather)}`
                    },
                    "accessory": {
                        "type": "image",
                        "image_url": "https://pbs.twimg.com/profile_images/625633822235693056/lNGUneLX_400x400.jpg",
                        "alt_text": "cute cat"
                    }
                }
            ]
        })
    })

    callback(null, {
        statusCode: 200,
        body: "success"
    });
}

