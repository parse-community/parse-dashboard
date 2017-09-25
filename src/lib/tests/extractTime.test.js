jest.dontMock('../extractTime');
const {extractExpiration, extractPushTime} = require('../extractTime');

describe('extractPushTime', () => {
  describe('in user\'s timezone', () => {
    it('should return without a timezone component', () => {
      const push_time = extractPushTime({
        "experiment_name": "",
        "exp_size_in_percent": 50,
        "push_time_type": "time",
        "push_time": "2017-09-29T19:01:00.000",
        "push_time_1": null,
        "push_time_2": null,
        "push_time_iso": "2017-09-29T23:01:00.000Z",
        "push_time_1_iso": null,
        "push_time_2_iso": null,
        "deliveryTime": null,
        "local_time": true,
        "push_expires": false,
        "expiration_time": null,
        "expiration_time_type": "time",
        "expiration_interval_num": "24",
        "expiration_interval_unit": "hours",
        "expirationInterval": null,
        "exp_type": "message",
        "exp_enable": null,
        "increment_badge": null,
        "audience_id": "new_segment",
        "data": "adasdasd",
        "data_type": "text",
        "data1": "",
        "data_type_1": "text",
        "data2": "",
        "data_type_2": "text",
        "translation_enable": null,
        "target": {
          "where": {
            "deviceType": {
              "$in": [
                "winrt"
              ]
            }
          }
        }
      });

      expect(push_time).toBe('2017-09-29T19:01:00.000');
    });
  });

  describe('In absolute time', () => {
    it('should return in UTC time', () => {
      const push_time = extractPushTime({
        "experiment_name": "",
        "exp_size_in_percent": 50,
        "push_time_type": "time",
        "push_time": "2017-09-30T19:18:00.000Z",
        "push_time_1": null,
        "push_time_2": null,
        "push_time_iso": "2017-09-30T19:18:00.000Z",
        "push_time_1_iso": null,
        "push_time_2_iso": null,
        "deliveryTime": null,
        "local_time": false,
        "push_expires": false,
        "expiration_time": null,
        "expiration_time_type": "time",
        "expiration_interval_num": "24",
        "expiration_interval_unit": "hours",
        "expirationInterval": null,
        "exp_type": "message",
        "exp_enable": null,
        "increment_badge": null,
        "audience_id": "everyone",
        "data": "asdsadas",
        "data_type": "text",
        "data1": "",
        "data_type_1": "text",
        "data2": "",
        "data_type_2": "text",
        "translation_enable": null
      });

      expect(push_time).toBe('2017-09-30T19:18:00.000Z');
    });
  });
});

describe('extractExpiration', () => {
  describe('With expiration interval', () => {
    describe('In user\'s local timezone', () => {
      describe('In hours', () => {
        const changes = {
          "experiment_name": "",
          "exp_size_in_percent": 50,
          "push_time_type": "time",
          "push_time": "2017-09-28T19:40:00.000",
          "push_time_1": null,
          "push_time_2": null,
          "push_time_iso": "2017-09-28T23:40:00.000Z",
          "push_time_1_iso": null,
          "push_time_2_iso": null,
          "deliveryTime": null,
          "local_time": true,
          "push_expires": true,
          "expiration_time": null,
          "expiration_time_type": "interval",
          "expiration_interval_num": "3",
          "expiration_interval_unit": "hours",
          "expirationInterval": null,
          "exp_type": "message",
          "exp_enable": null,
          "increment_badge": null,
          "audience_id": "everyone",
          "data": "asdsada",
          "data_type": "text",
          "data1": "",
          "data_type_1": "text",
          "data2": "",
          "data_type_2": "text",
          "translation_enable": null
        };

        it('should return the interval in seconds', () => {
          const { expiration_interval } = extractExpiration(changes);
          expect(expiration_interval).toBe(3 * 60 * 60); // 3 hours in seconds
        });
      });

      describe('In days', () => {
        const changes = {
          "experiment_name": "",
          "exp_size_in_percent": 50,
          "push_time_type": "time",
          "push_time": "2017-09-28T19:40:00.000",
          "push_time_1": null,
          "push_time_2": null,
          "push_time_iso": "2017-09-28T23:40:00.000Z",
          "push_time_1_iso": null,
          "push_time_2_iso": null,
          "deliveryTime": null,
          "local_time": true,
          "push_expires": true,
          "expiration_time": null,
          "expiration_time_type": "interval",
          "expiration_interval_num": "2",
          "expiration_interval_unit": "days",
          "expirationInterval": null,
          "exp_type": "message",
          "exp_enable": null,
          "increment_badge": null,
          "audience_id": "everyone",
          "data": "asdsada",
          "data_type": "text",
          "data1": "",
          "data_type_1": "text",
          "data2": "",
          "data_type_2": "text",
          "translation_enable": null
        };

        it('should return the interval in seconds', () => {
          const { expiration_interval } = extractExpiration(changes);
          expect(expiration_interval).toBe(2 * 24 * 3600); // 2 days in seconds
        });
      });
    });

    describe('In absolute time', () => {
      const changes = {
        "experiment_name": "",
        "exp_size_in_percent": 50,
        "push_time_type": "time",
        "push_time": "2017-09-28T19:40:00.000Z",
        "push_time_1": null,
        "push_time_2": null,
        "push_time_iso": "2017-09-28T19:40:00.000Z",
        "push_time_1_iso": null,
        "push_time_2_iso": null,
        "deliveryTime": null,
        "local_time": false,
        "push_expires": true,
        "expiration_time": null,
        "expiration_time_type": "interval",
        "expiration_interval_num": "3",
        "expiration_interval_unit": "hours",
        "expirationInterval": null,
        "exp_type": "message",
        "exp_enable": null,
        "increment_badge": null,
        "audience_id": "everyone",
        "data": "asdsada",
        "data_type": "text",
        "data1": "",
        "data_type_1": "text",
        "data2": "",
        "data_type_2": "text",
        "translation_enable": null
      };

      it('should return a UTC time in seconds', () => {
        const { expiration_interval } = extractExpiration(changes);
        expect(expiration_interval).toBe(3 * 60 * 60);
      });
    });

    describe('Sent immediately', () => {
      const changes = {
        "experiment_name": "",
        "exp_size_in_percent": 50,
        "push_time_type": "now",
        "push_time": null,
        "push_time_1": null,
        "push_time_2": null,
        "push_time_iso": null,
        "push_time_1_iso": null,
        "push_time_2_iso": null,
        "deliveryTime": null,
        "local_time": false,
        "push_expires": true,
        "expiration_time": null,
        "expiration_time_type": "interval",
        "expiration_interval_num": "24",
        "expiration_interval_unit": "hours",
        "expirationInterval": null,
        "exp_type": "message",
        "exp_enable": null,
        "increment_badge": null,
        "audience_id": "everyone",
        "data": "asdsada",
        "data_type": "text",
        "data1": "",
        "data_type_1": "text",
        "data2": "",
        "data_type_2": "text",
        "translation_enable": null
      };

      it('should return 24 hours in seconds', () => {
        const { expiration_interval } = extractExpiration(changes);
        expect(expiration_interval).toBe(60 * 60 * 24);
      });
    });
  });

  describe('With expiration date', () => {
    describe('In user\'s local timezone', () => {
      const changes = {
        "experiment_name": "",
        "exp_size_in_percent": 50,
        "push_time_type": "time",
        "push_time": "2017-09-28T19:40:00.000",
        "push_time_1": null,
        "push_time_2": null,
        "push_time_iso": "2017-09-28T23:40:00.000Z",
        "push_time_1_iso": null,
        "push_time_2_iso": null,
        "deliveryTime": null,
        "local_time": true,
        "push_expires": true,
        "expiration_time": "2017-09-30T15:47:00.000",
        "expiration_time_type": "time",
        "expiration_interval_num": "3",
        "expiration_interval_unit": "hours",
        "expirationInterval": null,
        "exp_type": "message",
        "exp_enable": null,
        "increment_badge": null,
        "audience_id": "everyone",
        "data": "asdsada",
        "data_type": "text",
        "data1": "",
        "data_type_1": "text",
        "data2": "",
        "data_type_2": "text",
        "translation_enable": null,
        "expiration_time_iso": "2017-09-30T19:47:00.000Z"
      };

      it('should return an expiration interval', () => {
        const { expiration_interval } = extractExpiration(changes);
        expect(expiration_interval).toBe(158820);
      });
    });

    describe('In absolute time', () => {
      const changes = {
        "experiment_name": "",
        "exp_size_in_percent": 50,
        "push_time_type": "time",
        "push_time": "2017-09-28T19:40:00.000Z",
        "push_time_1": null,
        "push_time_2": null,
        "push_time_iso": "2017-09-28T19:40:00.000Z",
        "push_time_1_iso": null,
        "push_time_2_iso": null,
        "deliveryTime": null,
        "local_time": false,
        "push_expires": true,
        "expiration_time": "2017-09-30T15:47:00.000Z",
        "expiration_time_type": "time",
        "expiration_interval_num": "3",
        "expiration_interval_unit": "hours",
        "expirationInterval": null,
        "exp_type": "message",
        "exp_enable": null,
        "increment_badge": null,
        "audience_id": "everyone",
        "data": "asdsada",
        "data_type": "text",
        "data1": "",
        "data_type_1": "text",
        "data2": "",
        "data_type_2": "text",
        "translation_enable": null,
        "expiration_time_iso": "2017-09-30T15:47:00.000Z"
      };

      it('should return a relative date', () => {
        const { expiration_time } = extractExpiration(changes);
        expect(expiration_time).toBe('2017-09-30T15:47:00.000Z');
      });
    });

    describe('Sent immediately', () => {
      const changes = {
        "experiment_name": "",
        "exp_size_in_percent": 50,
        "push_time_type": "now",
        "push_time": "2017-09-28T19:40:00.000Z",
        "push_time_1": null,
        "push_time_2": null,
        "push_time_iso": "2017-09-28T19:40:00.000Z",
        "push_time_1_iso": null,
        "push_time_2_iso": null,
        "deliveryTime": null,
        "local_time": false,
        "push_expires": true,
        "expiration_time": "2017-09-30T15:47:00.000Z",
        "expiration_time_type": "time",
        "expiration_interval_num": "3",
        "expiration_interval_unit": "hours",
        "expirationInterval": null,
        "exp_type": "message",
        "exp_enable": null,
        "increment_badge": null,
        "audience_id": "everyone",
        "data": "asdsada",
        "data_type": "text",
        "data1": "",
        "data_type_1": "text",
        "data2": "",
        "data_type_2": "text",
        "translation_enable": null,
        "expiration_time_iso": "2017-09-30T15:47:00.000Z"
      };

      it('should return an absolute time', () => {
        const { expiration_time } = extractExpiration(changes);
        expect(expiration_time).toBe('2017-09-30T15:47:00.000Z');
      });
    });
  });
});
