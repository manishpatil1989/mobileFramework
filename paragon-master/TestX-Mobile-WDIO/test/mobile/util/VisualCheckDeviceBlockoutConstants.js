'use strict';
const constants = {
    BLOCK_OUT_AREA_ESLIP_TOASTER_MESSAGE: {
        IOS:         
        //iOS eSlip toaster message. 
        {
            height: 95,
            width: 780,
            x: 30,
            y: 95,
        },
        ANDROID:         
        //Android eSlip toaster message. 
        {
            height: 200,
            width: 1025,
            x: 25,
            y: 60,
        },
    },
    IOS_COMPARE_SCREEN_DEFAULT_OPTION: {
        elementBlockOuts: [
        ],
        blockOuts: [
            //Iphone 11 bottom bar
            {
                height: 20,
                width: 310,
                x: 260,
                y: 1760,
            },
            //iOS right side scroll bar
            {
                height: 1790,
                width: 20,
                x: 810,
                y: 0,
            },   
        ]
    },
    ANDROID_COMPARE_SCREEN_DEFAULT_OPTION:  {
        elementBlockOuts: [
        ],
        blockOuts: [
            //Android right side scroll bar
            {
                height: 1910,
                width: 20,
                x: 1060,
                y: 0,
            },
        ]
    },
    BLOCK_OUT_AREA_OTP_REFERENCE_CODE:  {
        IOS:         
        //iOS otp reference code
        {
            height: 50,
            width: 145,
            x: 20,
            y: 550,
        },
        ANDROID:         
        //Android otp reference code
        {
            height: 50,
            width: 145,
            x: 43,
            y: 585,
        },
    }
};

module.exports =
        Object.freeze(constants); 