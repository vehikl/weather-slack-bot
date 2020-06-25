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

  return `${imageToEmoji[body.weather[0].icon]}  The weather is ${body.main.temp}°C and ${body.weather[0].description} in ${body.name}.`;
}

exports.handler = async function (event, context, callback) {  
  const offices = [6176823, 6058560, 5969785, 5964700];
  const { data } = await axios.get(`http://api.openweathermap.org/data/2.5/group?id=${offices}&units=metric&appid=${process.env.WEATHER_KEY}`)

  try {
    await axios.post('https://slack.com/api/chat.postMessage', {
      channel: process.env.CHANNEL,
      blocks: [ ...data.list.map((city) => ({ type: 'section', text: { type: 'mrkdwn', text: displayText(city) } })) ]
    });
  } catch (err) {
    await axios.post('https://slack.com/api/chat.postMessage', {
      channel: process.env.CHANNEL,
      text: `:no_entry: Error: office body not well formed`
    });
  }

  callback(null, { statusCode: 204, body: '' });
};
