// @ts-check
const axios = require('axios').default;
axios.defaults.headers.common['Authorization'] = `Bearer ${process.env.TOKEN}`;

function displayText(body) {
  return `:sunny: The weather is ${body.main.temp} and ${body.weather.description} in ${body.name}`;
}

function getWeatherIcon(body) {
  const [dayIcon] = body.weather;
  return `http://openweathermap.org/img/wn/${dayIcon.icon}@2x.png`;
}

exports.handler = async function (event, context, callback) {
  const city = 'Waterlo, CA';

  try {
    const { data } = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${process.env.WEATHER_KEY}`
    );

    const iconUrl = getWeatherIcon(data);

    await axios.post('https://slack.com/api/chat.postMessage', {
      channel: process.env.CHANNEL,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: displayText(data)
          },
          accessory: {
            type: 'image',
            image_url: iconUrl,
            alt_text: data.weather.description
          }
        }
      ]
    });
  } catch (err) {
    await axios.post('https://slack.com/api/chat.postMessage', {
      channel: process.env.CHANNEL,
      text: `Could not find city: ${city}`
    });
  }

  callback(null, { statusCode: 204, body: '' });
};
