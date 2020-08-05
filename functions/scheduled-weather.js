// @ts-check
const axios = require('axios').default;
const { CHANNEL, TOKEN, WEATHER_KEY } = process.env
axios.defaults.headers.common['Authorization'] = `Bearer ${TOKEN}`;

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

const getCityWeather = async () => {
  const offices = [];

  const officeCoords = [ 
    { name: 'london', latitude: 42.98, longitude: -81.25 }, 
    { name: 'waterloo', latitude: 43.47, longitude: -80.52 }, 
    { name: 'hamilton', latitude: 43.26, longitude: -79.84 }, 
    { name: 'sudbury', latitude: 46.50, longitude: -80.99 } 
  ];

  await Promise.all(
    officeCoords.map(async ({name, latitude, longitude}) => {
      const EXCLUDE = 'exclude=hourly,minutely';
    
      const { data: { current, daily: [ today ] } } = await axios.get(
        `https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&${EXCLUDE}&units=metric&appid=${WEATHER_KEY}`
      );
    
      offices.push({ city: name.toUpperCase(), current, daily: today })
    })
  );

  return offices;
}

exports.handler = async function (event, context, callback) {  
  const data = await getCityWeather();

  try {
    await axios.post('https://slack.com/api/chat.postMessage', {
      channel: CHANNEL,
      blocks: [ 
        {
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": "Today's weather in the greater Vehikl area. \n *_You should probably play it safe and stay inside!_* :colin_kent:"
          }
        },
        { "type": "divider" },
        ...data.map(({ city, current, daily }) => ({
          type: 'section', 
          text: {
            "text": `*${city}* _*High*: ${daily.temp.max}°C / *Low*: ${daily.temp.min}°C / *Humidity*: ${daily.humidity}%_ \n _*Weather conditions* Current: ${current.weather[0].description} / Daily: ${daily.weather[0].description}_`,
            "type": "mrkdwn"
          },
          fields: [
            { "type": "mrkdwn", "text": "*Morning*" },
            { "type": "mrkdwn", "text": "*Feels Like*" },
            { "type": "plain_text", "text": `${imageToEmoji[daily.weather[0].icon]} ${daily.temp.morn}°C` },
            { "type": "plain_text", "text": `${daily.feels_like.morn}°C` },
            { "type": "mrkdwn", "text": "*Afternoon*" },
            { "type": "mrkdwn", "text": "*Feels Like*" },
            { "type": "plain_text", "text": `${imageToEmoji[daily.weather[0].icon]} ${daily.temp.eve}°C` },
            { "type": "plain_text", "text": `${daily.feels_like.eve}°C` }
          ],
          accessory: {
            "type": "image",
            "image_url": "https://cdn.dribbble.com/users/915711/screenshots/5827243/weather_icon3.png",
            "alt_text": "weather thumbnail"
          }
        }))
      ]
    });
  } catch (err) {
    await axios.post('https://slack.com/api/chat.postMessage', { channel: CHANNEL, text: `:no_entry: Error: office body not well formed` });
  }

  callback(null, { statusCode: 204, body: '' });
};
