var jsonOverride = require('../util/jsonOverride');

var self = {
    blockOuts: {
        "blockOut_Default": {
            height: 10,
            width: 10,
            x: 10,
            y: 10,
        },

        "Android_blockOut_Homepage": {
            height: 400,
            width: 740,
            x: 272,
            y: 572,
        },
    },
    elementBlockOuts: {
        "elementBlockOut_Default": {

        },
    },

    getblockOut: function (blockOutInfoKey) {
        if (blockOutInfoKey.includes("element")) {
            return jsonOverride.getOverriddenData(self.elementBlockOuts, 'elementBlockOut_Default', blockOutInfoKey);
        } else {
            return jsonOverride.getOverriddenData(self.blockOuts, 'blockOut_Default', blockOutInfoKey);
        }
    }
};

exports.blockOutObject = self;