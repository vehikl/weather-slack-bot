// @ts-check

const axios = require('axios').default;
axios.defaults.headers.common['Authorization'] = `Bearer ${process.env.TOKEN}`;

function displayText(body) {
  const imageToEmoji = {
    '01d': ':sunny:',
    '01n': ':moon:',
    '02d': ':sun_small_cloud:',
    '02n': ':cloud:',
    '03d': ':cloud:',
    '03n': ':cloud:',
    '04d': ':cloud:',
    '04n': ':cloud:',
    '10d': ':rain_cloud:',
    '10n': ':rain_cloud:',
    '11d': ':thunder_cloud_and_rain:',
    '11n': ':thunder_cloud_and_rain:',
    '13d': ':snowflake:',
    '13n': ':snowflake:',
    '50d': ':fog:',
    '50n': ':fog:'
  };

  return `${imageToEmoji[body.weather[0].icon]} The weather is ${body.main.temp} and ${body.weather[0].description} in ${body.name}`;
}

function getWeatherIcon(body) {
  const [dayIcon] = body.weather;
  return `http://openweathermap.org/img/wn/${dayIcon.icon}@2x.png`;
}

exports.handler = async function (event, context, callback) {
  const parsed = new URLSearchParams(event.body);
  const city = parsed.get('text') || '';

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
            alt_text: data.weather[0].description
          }
        }
      ]
    });
  } catch (err) {
    await axios.post('https://slack.com/api/chat.postMessage', {
      channel: process.env.CHANNEL,
      text: `Could not find city:  ${city || '<No city provided>'}`
    });
  }

  callback(null, { statusCode: 204, body: '' });
};
