const axios = require('axios')
const puppeteer = require('puppeteer-core')
const fs = require('fs');
const { parse } = require('papaparse');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const asyncWrap = (promise) => {
    return promise.then((result) => [null, result]).catch((err) => [err]);
}
async function startup() {
    const file = 'GreatWhiteUser.csv'
    const content = fs.readFileSync(file, "utf8")
    const readedFile = parse(content, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => console.dir(result.data)
    }).data;
    for (let i = 0; i < readedFile.length; i++) {
        console.log("STARTING WITH", i)
        const record = readedFile[i];
        const { Latitude, Longitude } = record;
        if (!Latitude || !Longitude || Latitude === 'NULL' || Latitude == '0' || Longitude == '0' || Longitude === 'NULL') {
            fs.appendFileSync("some-lat-long.csv", `N/A\n`);
        } else {
            const [error, result] = await asyncWrap(axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${Latitude}&lon=${Longitude}&zoom=27&addressdetails=1`))
            if (error) {
                fs.appendFileSync("some-lat-long.csv", `N/A\n`);
            } else {
                fs.appendFileSync("some-lat-long.csv", `${result.data.display_name}\n`)
            }
        }
        console.log("ENDING WITH", i)
    }
    process.exit(0)
}
startup()
      