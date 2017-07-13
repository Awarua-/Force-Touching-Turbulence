'use-strict';

const HID = require('node-hid');

class Scale {

    constructor(cb) {
        this.device = new HID.HID(2338, 32771);
        this.callback = cb;
        this._setup();
    }

    _setup() {
        this.device.on("data", data => {
            let grams = data[4] + (256 * data[5])
            this.callback({weight: grams, stable: false})
        });

        this.device.on("error", error => {
            //The scale lost power
            this.interval = setInterval(() => {
                try {
                    let device = new HID.HID(2338, 32771);
                    this.device = device;
                    this._setup();
                    clearInterval(this.interval)
                }
                catch (e) {
                    //Device is stil missing, continue to check later
                    return;
                }
            }, 5000);
        })
    }

    destructor() {
        return new Promise((resolve, reject) => {
            try {
                this.device.close()
            }
            catch (err) {
                reject(err);
            }
        });
    }
}

module.exports = Scale;

// let device = new HID.HID(2338, 32771);
// device.setNonBlocking(1);
// let prevTime = Date.now();
// let times = []
// setInterval(() => {
//     device.read((err, data) => {
//         let time = Date.now();
//         times.push((time - prevTime), data);
//         prevTime = time;
//     });
// }, 33);
//
// setInterval(() => {
//     console.log(times);
//     times = [];
// }, 1000);
