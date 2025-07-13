document.addEventListener('DOMContentLoaded', () => {
    const dateInput = document.getElementById('date-input');
    const consumptionInput = document.getElementById('consumption-input');
    const addDataBtn = document.getElementById('add-data-btn');
    const predictedBillEl = document.getElementById('predicted-bill');
    const downloadBillBtn = document.getElementById('download-bill-btn');
    const ctx = document.getElementById('consumption-chart').getContext('2d');

    let chart;

    const API_URL = 'http://localhost:3000/api';

    // Ensure dateFns is globally available for chartjs-adapter-date-fns
    // The UMD build of date-fns might not always attach to window.dateFns directly.
    // This ensures it's there if not already.
    if (typeof dateFns === 'undefined' && typeof window.dateFns === 'undefined') {
        // This assumes the UMD build is loaded and exposes itself in some way,
        // or we might need to load a specific global build.
        // For now, we'll assume it's available via a different global or needs explicit assignment.
        // A more robust solution might involve importing it if using a module bundler.
        // Given the current setup, we'll rely on the CDN to expose it.
        // If the error persists, the CDN link itself might not be providing the expected global.
        console.warn("dateFns not found globally. Chart.js adapter might fail.");
    }

    function initializeChart() {
        chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Electricity Consumption (units)',
                    data: [],
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'day'
                        },
                        adapters: {
                            date: {
                                // Ensure dateFns.enUS is correctly referenced
                                locale: window.dateFns.enUS || dateFns.enUS
                            }
                        }
                    },
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    async function fetchConsumptionData() {
        try {
            const response = await fetch(`${API_URL}/consumption`);
            const data = await response.json();
            updateChart(data);
        } catch (error) {
            console.error('Error fetching consumption data:', error);
        }
    }

    async function addData() {
        const date = dateInput.value;
        const consumption = parseFloat(consumptionInput.value);

        if (date && !isNaN(consumption)) {
            try {
                const response = await fetch(`${API_URL}/consumption`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ date, consumption })
                });
                if (response.ok) {
                    fetchConsumptionData();
                    predictBill();
                    dateInput.value = '';
                    consumptionInput.value = '';
                } else {
                    alert('Failed to add data.');
                }
            } catch (error) {
                console.error('Error adding data:', error);
                alert('Error adding data.');
            }
        } else {
            alert('Please enter valid date and consumption values.');
        }
    }

    function updateChart(data) {
        chart.data.labels = data.map(d => d.date);
        chart.data.datasets[0].data = data.map(d => d.consumption);
        chart.update();
    }

    async function predictBill() {
        try {
            const response = await fetch(`${API_URL}/prediction`);
            const data = await response.json();
            predictedBillEl.textContent = data.predictedBill;
        } catch (error) {
            console.error('Error fetching prediction:', error);
            predictedBillEl.textContent = 'Error fetching prediction.';
        }
    }

    function downloadBill() {
        const billAmount = predictedBillEl.textContent;
        const inputDate = dateInput.value; // Get the date from the input field

        let statementDate = 'N/A';
        let periodFrom = 'N/A';
        let periodUntil = 'N/A';
        let dueDate = 'N/A';

        if (inputDate) {
            const parsedDate = dateFns.parseISO(inputDate); // Parse the input date
            statementDate = dateFns.format(parsedDate, 'MMMM dd, yyyy');
            periodUntil = dateFns.format(parsedDate, 'MMMM dd, yyyy');
            periodFrom = dateFns.format(dateFns.subDays(parsedDate, 12), 'MMMM dd, yyyy'); // 12 days before for example
            dueDate = dateFns.format(dateFns.addDays(parsedDate, 6), 'MMMM dd, yyyy'); // 6 days after for example
        }

        const billContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <title>Utility Bill</title>
                <style>
                    body { font-family: sans-serif; margin: 20px; }
                    .bill-container { max-width: 800px; margin: auto; padding: 20px; border: 1px solid #ccc; }
                    .header { text-align: center; font-size: 24px; font-weight: bold; margin-bottom: 20px; }
                    .info-section { display: flex; justify-content: space-between; margin-bottom: 20px; }
                    .info-left, .info-right { width: 48%; }
                    .info-right { background-color: #f5e6d3; padding: 15px; }
                    .meter-info, .bill-summary { margin-bottom: 20px; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    .summary-table { background-color: #e0f7fa; }
                </style>
            </head>
            <body>
                <div class="bill-container">
                    <div class="header">UTILITY BILL</div>
                    <div class="info-section">
                        <div class="info-left">
                            <strong>Account No.</strong> 12345678910<br>
                            <strong>Account Name</strong> Priya Sharma<br>
                            <strong>Address</strong> 123, Gandhi Road, Bandra West, Mumbai, Maharashtra, 400050
                        </div>
                        <div class="info-right">
                            <strong>Statement Date</strong> ${statementDate}<br>
                            <strong>Period Statement From</strong> ${periodFrom}<br>
                            <strong>Period Statement until</strong> ${periodUntil}
                        </div>
                    </div>
                    <div class="meter-info">
                        <strong>Meter Information</strong>
                        <table>
                            <tr><th>Date</th><th>Usage (kWh)</th><th>Cost (per kWh)</th><th>Amount (₹)</th></tr>
                            <tr><td>${inputDate ? dateFns.format(dateFns.parseISO(inputDate), 'MM/dd/yyyy') : 'N/A'}</td><td>300</td><td>10</td><td>3000</td></tr>
                        </table>
                    </div>
                    <div class="bill-summary">
                        <strong>Bill Summary</strong>
                        <table class="summary-table">
                            <tr><td>Previous Charges (₹)</td><td>₹ 1.00</td></tr>
                            <tr><td>Current Charges (₹)</td><td>₹ 3,000.00</td></tr>
                            <tr><td>Total Amount (₹)</td><td>${billAmount}</td></tr>
                            <tr><td>Due Date</td><td>${dueDate}</td></tr>
                        </table>
                    </div>
                </div>
            </body>
            </html>
        `;
        const blob = new Blob([billContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'electricity_bill.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    addDataBtn.addEventListener('click', addData);
    downloadBillBtn.addEventListener('click', downloadBill);
    initializeChart();
    fetchConsumptionData();
    predictBill();
});
