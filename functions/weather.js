// @ts-check

const axios = require('axios').default;
axios.defaults.headers.common['Authorization'] = `Bearer ${process.env.TOKEN}`;

async function getWeather(city) {
    const weather = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${process.env.WEATHER_KEY}`);
    return weather.data;
}

exports.handler = async function (event, context, callback) {
    const weather = await getWeather('waterloo, ca');

    function display(body) {
        return `The weather is ${body.main.temp} in ${body.name}`
    }

    const res = await axios.post(
        "https://slack.com/api/chat.postMessage",
        {
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
        });

    callback(null, {
        statusCode: 200,
        body: 'success'
    });
}

