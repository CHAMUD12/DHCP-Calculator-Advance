document.getElementById("add-more-static-ip").addEventListener("click", function() {
    const staticIpList = document.getElementById("static-ip-list");
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Static IP";
    input.classList.add("static-ip");
    staticIpList.appendChild(input);
});

document.getElementById("add-more-static-ip-range").addEventListener("click", function() {
    const staticIpRangeList = document.getElementById("static-ip-range-list");
    const div = document.createElement("div");
    div.classList.add("static-ip-range");
    div.innerHTML = `<input type="text" class="static-ip-start" placeholder="Start IP">
                     <input type="text" class="static-ip-end" placeholder="End IP">`;
    staticIpRangeList.appendChild(div);
});

document.getElementById("calculate").addEventListener("click", function() {
    const startIp = document.getElementById("start-ip").value;
    const endIp = document.getElementById("end-ip").value;
    const staticIps = Array.from(document.getElementsByClassName("static-ip"))
                           .map(input => input.value)
                           .filter(ip => ip !== "");

    const staticIpRanges = Array.from(document.getElementsByClassName("static-ip-range"))
                                .map(range => ({
                                    start: range.querySelector(".static-ip-start").value,
                                    end: range.querySelector(".static-ip-end").value
                                }))
                                .filter(range => range.start !== "" && range.end !== "");

    const usableRanges = calculateUsableRange(startIp, endIp, staticIps, staticIpRanges);
    displayResult(usableRanges);
});

function calculateUsableRange(startIp, endIp, staticIps, staticIpRanges) {
    const start = ipToNumber(startIp);
    const end = ipToNumber(endIp);
    const staticIpNumbers = staticIps.map(ip => ipToNumber(ip)).sort((a, b) => a - b);
    const staticIpRangeNumbers = staticIpRanges.map(range => ({
        start: ipToNumber(range.start),
        end: ipToNumber(range.end)
    })).sort((a, b) => a.start - b.start);

    const usableRanges = [];
    let currentStart = start;

    staticIpNumbers.forEach(staticIp => {
        if (currentStart < staticIp) {
            usableRanges.push([currentStart, staticIp - 1]);
        }
        currentStart = staticIp + 1;
    });

    staticIpRangeNumbers.forEach(range => {
        if (currentStart < range.start) {
            usableRanges.push([currentStart, range.start - 1]);
        }
        currentStart = range.end + 1;
    });

    if (currentStart <= end) {
        usableRanges.push([currentStart, end]);
    }

    return usableRanges.map(range => numberToIp(range[0]) + " - " + numberToIp(range[1]));
}

function ipToNumber(ip) {
    return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0);
}

function numberToIp(number) {
    return [
        (number >> 24) & 255,
        (number >> 16) & 255,
        (number >> 8) & 255,
        number & 255
    ].join('.');
}

function displayResult(ranges) {
    const resultArea = document.getElementById("result-area");
    if (ranges.length === 0) {
        resultArea.value = "# No usable IPs available";
    } else {
        resultArea.value = "# Result is .....\n" + ranges.map(range => `# ${range}`).join("\n");
    }
}
