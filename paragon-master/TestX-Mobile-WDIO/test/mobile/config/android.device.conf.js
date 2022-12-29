var jsonOverride = require('../util/jsonOverride');

var self = {
    deviceInfo: {
        "deviceInfo_Default": {
            "platformVersion": "29.0",
            "deviceName" : "Pixel_2_API_29",
            "systemPort" : 8100,
            "appiumPort" : 4724,
        },

        "Pixel_2_API_27": {
            "platformVersion": "27.0",
            "deviceName" : "Pixel_2_API_27",
            "systemPort" : 8101,
            "appiumPort" : 4725,
            "proxyPort": 20004
        },

    },

    getdeviceInfo: function (deviceInfoKey) {
        return jsonOverride.getOverriddenData(self.deviceInfo, 'deviceInfo_Default', deviceInfoKey);
    }
};

exports.deviceInfoList = self;
