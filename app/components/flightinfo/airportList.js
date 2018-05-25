const YOW_ARRIVAL = 'https://yow.ca/en/flight_info/current?flightType=1';
const YOW_DEPARTURE = 'https://yow.ca/en/flight_info/current?flightType=2';

module.exports = {
  YOW_ARRIVAL,
  YOW_DEPARTURE,
  yow() {
    return { name: 'YOW', endpoints: [YOW_ARRIVAL, YOW_DEPARTURE] };
  },
};
