document.addEventListener('DOMContentLoaded', () => {
    const dateInput = document.getElementById('date-input');
    const consumptionInput = document.getElementById('consumption-input');
    const addDataBtn = document.getElementById('add-data-btn');
    const predictedBillEl = document.getElementById('predicted-bill');
    const downloadBillBtn = document.getElementById('download-bill-btn');
    const ctx = document.getElementById('consumption-chart').getContext('2d');

    let chart;
    let consumptionRecords = []; // To store fetched consumption data

    const API_URL = 'http://localhost:3000/api';

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
                                locale: dateFns.enUS
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
            consumptionRecords = data; // Store the fetched data
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

    function downloadBill(data) {
        const billAmount = predictedBillEl.textContent;
        const inputDate = dateInput.value;

        let statementDate = 'N/A';
        let periodFrom = 'N/A';
        let periodUntil = 'N/A';
        let dueDate = 'N/A';

        let totalConsumption = 0;
        let currentCharges = 0;
        const TARIFF_PER_UNIT = 7.5; // This should ideally come from server or config

        if (data && data.length > 0) {
            // Get the latest date from the data for statement date and period until
            const latestRecord = data[data.length - 1];
            const parsedLatestDate = dateFns.parseISO(latestRecord.date);
            statementDate = dateFns.format(parsedLatestDate, 'MMMM dd, yyyy');
            periodUntil = dateFns.format(parsedLatestDate, 'MMMM dd, yyyy');
            periodFrom = dateFns.format(dateFns.subDays(parsedLatestDate, 30), 'MMMM dd, yyyy'); // Assuming a monthly bill
            dueDate = dateFns.format(dateFns.addDays(parsedLatestDate, 15), 'MMMM dd, yyyy'); // Due 15 days after statement

            // Calculate total consumption and current charges for the period
            // For simplicity, let's sum all available data for "current charges" in the bill
            // A more robust solution would involve filtering data for the specific billing period
            totalConsumption = data.reduce((sum, record) => sum + record.consumption, 0);
            currentCharges = totalConsumption * TARIFF_PER_UNIT;
        }

        const meterInfoRows = data.map(d => `
            <tr>
                <td>${dateFns.format(dateFns.parseISO(d.date), 'MM/dd/yyyy')}</td>
                <td>${d.consumption.toFixed(2)}</td>
                <td>${TARIFF_PER_UNIT.toFixed(2)}</td>
                <td>${(d.consumption * TARIFF_PER_UNIT).toFixed(2)}</td>
            </tr>
        `).join('');

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
                            ${meterInfoRows}
                        </table>
                    </div>
                    <div class="bill-summary">
                        <strong>Bill Summary</strong>
                        <table class="summary-table">
                            <tr><td>Previous Charges (₹)</td><td>₹ 0.00</td></tr>
                            <tr><td>Current Charges (₹)</td><td>₹ ${currentCharges.toFixed(2)}</td></tr>
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
    downloadBillBtn.addEventListener('click', () => downloadBill(consumptionRecords));
    initializeChart();
    fetchConsumptionData();
    predictBill();
});
