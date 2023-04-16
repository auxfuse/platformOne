const timerEl = document.getElementById('timer');

let timer = () => {
    let end = new Date("May 27, 2023 18:00:00 GMT");
    let endTime = (Date.parse(end)) / 1000;

    let now = new Date();
    let nowTime = (Date.parse(now)) / 1000;

    let timeLeft = endTime - nowTime;

    let days = Math.floor(
        timeLeft / 86400
    );
    let hours = Math.floor(
        (timeLeft - (days * 86400)) / 3600
    );
    let mins = Math.floor(
        (timeLeft - (days * 86400) - (hours * 3600)) / 60
    );
    let secs = Math.floor(
        (timeLeft - (days * 86400) - (hours * 3600) - (mins * 60))
    );

    if (hours < "10") {
        hours = "0" + hours;
    }
    if (mins < "10") {
        mins = "0" + mins;
    }
    if (secs < "10") {
        secs = "0" + secs;
    }

    timerEl.textContent = `${days} days / ${hours} hrs / ${mins} mins / ${secs} secs`;
};

setInterval(function() {
    timer();
}, 1000);
