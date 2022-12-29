class HttpTrafficInScenario {
    constructor() {
        this.traffics = [];
        this.represatationInReport = "";
    }

    attachPair(req, resp, phase = "onResponse") {
        this.traffics.push({"request": req, "response": resp, "phase": phase});
    }

    toReportFormat() {
        let ret = "";
        for (const {request, response, phase} of this.traffics) {
            const responseSection = 
                `response (${response.statusCode}): ${response.json ? JSON.stringify(response.json, null, '  ') : response.rawBody}`;
            ret +=
            `phase: ${phase}, method: ${request.method}, URL: ${request.url}\r\n  request.headers: ${JSON.stringify(request.headers, null, '  ')}\r\n request: ${JSON.stringify(request.json, null, '  ')}\r\n  ${responseSection}\r\n\r\n`;
        }
        return ret;
    }

    findLastMatchingPair(requestPath, direction, key) {
        for (const pair of this.traffics.reverse()) {
            if (pair.request.url === requestPath) {
                return pair[direction].json[key];
            }
        }

        throw new Error(`[HttpTrafficInScenario]: unable to find ${key} in ${direction} at path ${requestPath}`);
    }
}

module.exports = HttpTrafficInScenario;