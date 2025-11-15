// -------- MOCK DATA FOR CHART --------
function generateMockData(numPoints) {
    let data = [];
    let labels = [];
    let lastVal = 50000 + Math.random() * 10000;
    const now = Date.now();

    for (let i = 0; i < numPoints; i++) {
        let volatility = numPoints === 365 ? 400 : numPoints === 30 ? 200 : 100;
        lastVal += (Math.random() - 0.5) * volatility;
        if (lastVal < 10000) lastVal = 10000;

        data.push(lastVal.toFixed(2));
        labels.push(new Date(now - (numPoints - i - 1) * 24 * 60 * 60 * 1000));
    }

    return {
        labels,
        datasets: [{
            label: "Price (USD)",
            data,
            borderColor: "rgb(59,130,246)",
            backgroundColor: "rgba(59,130,246,0.1)",
            fill: true,
            tension: 0.3,
            pointRadius: 0
        }]
    };
}

const mockData = {
    week: generateMockData(7),
    month: generateMockData(30),
    year: generateMockData(365)
};

document.addEventListener("DOMContentLoaded", () => {

    // -------- USD PRICE (STATIC) --------
    document.getElementById("real-time-price").innerText = "$60,123.45";
    document.getElementById("price-change").innerText = "+1.25% (24h)";
    document.getElementById("last-updated").innerText = new Date().toLocaleTimeString();

    // -------- CHART --------
    const ctx = document.getElementById("priceChart").getContext("2d");

    const priceChart = new Chart(ctx, {
        type: "line",
        data: mockData.week,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { type: "time", time: { unit: "day" } },
                y: {
                    ticks: {
                        callback: value => "$" + value.toLocaleString()
                    }
                }
            },
            plugins: { legend: { display: false } }
        }
    });

    // -------- BUTTON FIX (IMPORTANT) --------
    const btnWeek = document.getElementById("btn-week");
    const btnMonth = document.getElementById("btn-month");
    const btnYear = document.getElementById("btn-year");

    const buttons = document.querySelectorAll(".tab-btn");

    function updateChart(data, btn) {
        priceChart.data = data;
        priceChart.update();

        buttons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
    }

    btnWeek.onclick = () => updateChart(mockData.week, btnWeek);
    btnMonth.onclick = () => updateChart(mockData.month, btnMonth);
    btnYear.onclick = () => updateChart(mockData.year, btnYear);
});


// -------- BTC ⇄ INR LIVE RATE --------
let btcToInrRate = 0;

async function fetchINRRate() {
    try {
        const response = await fetch(
            "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=inr"
        );

        const data = await response.json();
        btcToInrRate = data.bitcoin.inr;

        document.getElementById("btcRate").innerText =
            `1 BTC = ₹${btcToInrRate.toLocaleString("en-IN")}`;

    } catch (error) {
        document.getElementById("btcRate").innerText = "Failed to load rate";
    }
}

fetchINRRate();
setInterval(fetchINRRate, 60000);


// -------- CONVERTER --------
document.getElementById("btcInput").addEventListener("input", function () {
    if (!btcToInrRate) return;
    const btc = parseFloat(this.value) || 0;
    document.getElementById("inrInput").value = (btc * btcToInrRate).toFixed(2);
});

document.getElementById("inrInput").addEventListener("input", function () {
    if (!btcToInrRate) return;
    const inr = parseFloat(this.value) || 0;
    document.getElementById("btcInput").value = (inr / btcToInrRate).toFixed(6);
});


// -------- REAL-TIME INR PRICE --------
async function fetchLivePriceINR() {
    try {
        const response = await fetch(
            "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=inr&include_24hr_change=true"
        );

        const data = await response.json();
        const priceINR = data.bitcoin.inr;
        const changeINR = data.bitcoin.inr_24h_change;

        document.getElementById("real-time-price-inr").innerText =
            `₹${priceINR.toLocaleString("en-IN")}`;

        const changeEl = document.getElementById("price-change-inr");
        changeEl.innerText = `${changeINR.toFixed(2)}% (24h)`;

        if (changeINR < 0) {
            changeEl.classList.add("text-red-400");
            changeEl.classList.remove("text-green-400");
        } else {
            changeEl.classList.add("text-green-400");
            changeEl.classList.remove("text-red-400");
        }

        document.getElementById("last-updated-inr").innerText =
            new Date().toLocaleTimeString();

    } catch (error) {
        document.getElementById("real-time-price-inr").innerText = "Error";
    }
}

fetchLivePriceINR();
setInterval(fetchLivePriceINR, 10000);
