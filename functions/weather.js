// @ts-check

const axios = require('axios').default;
axios.defaults.headers.common['Authorization'] = `Bearer ${process.env.TOKEN}`;


exports.handler = async function (event, context, callback) {
    const parsed = new URLSearchParams(event.body);

    const city = parsed.get('text') || '';
    try {
        const weather = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${process.env.WEATHER_KEY}`);

        await axios.post(
            "https://slack.com/api/chat.postMessage",
            {
                channel: "CEPE43JQ0",
                blocks: [
                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": `:sunny: ${display(weather.data)}`
                        },
                        "accessory": {
                            "type": "image",
                            "image_url": "https://pbs.twimg.com/profile_images/625633822235693056/lNGUneLX_400x400.jpg",
                            "alt_text": "cute cat"
                        }
                    }
                ]
            });
    } catch (err) {
        await axios.post(
            "https://slack.com/api/chat.postMessage",
            {
                channel: "CEPE43JQ0",
                text: "Could not find city " + city
            });
    }

    function display(body) {
        return `The weather is ${body.main.temp} in ${body.name}`
    }

    callback(null, { statusCode: 204, body: '' });
}

