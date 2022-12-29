var jsonOverride = require('../util/jsonOverride');

var self = {
    deviceInfo: {
        "deviceInfo_Default": {
            "platformVersion": "15.2",
            "deviceName" : "iPhone 13 - 1",
            "wdaLocalPort" : 8200,
            "appiumPort" : 4824,
            "proxyPort": 10003,
            "httpProxyPort": 11003
        },

        "iPhone 13_15.2": {
            "platformVersion": "15.2",
            "deviceName" : "iPhone 13 - 1",
            "wdaLocalPort" : 8201,
            "appiumPort" : 4825,
            "proxyPort": 10004
        },

        "iPhone 11_15.2": {
            "platformVersion": "15.2",
            "deviceName" : "iPhone 11 - 1",
            "wdaLocalPort" : 8201,
            "appiumPort" : 4825,
            "proxyPort": 10004
        },
    },

    getdeviceInfo: function (deviceInfoKey) {
        return jsonOverride.getOverriddenData(self.deviceInfo, 'deviceInfo_Default', deviceInfoKey);
    }
};

exports.deviceInfoList = self;
