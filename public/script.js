document.addEventListener('DOMContentLoaded', function() {
    // Get the user_id from localStorage (you might set this after user logs in)
    const userId = localStorage.getItem('user_id');

    // Function to fetch and display the data from the server
    function fetchOutbreakData() {
        // Fetch data from the API endpoint, passing the user_id as a query parameter
        fetch(`/api/incidents`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch data');
                }
                return response.json();
            })
            .then(data => {
                // Populate the table with outbreak data
                const outbreaks = data.incidences; // assuming 'incidences' data
                const tableBody = document.querySelector('#outbreak-table tbody');

                // Clear any existing rows
                tableBody.innerHTML = '';

                // Initialize totals
                let totalCases = 0;
                let totalDeaths = 0;

                // Loop through the incidents and create a table row for each
                outbreaks.forEach(outbreak => {
                    const row = document.createElement('tr');

                    const regionCell = document.createElement('td');
                    regionCell.textContent = outbreak.location;
                    row.appendChild(regionCell);

                    const diseaseCell = document.createElement('td');
                    diseaseCell.textContent = outbreak.disease_name;
                    row.appendChild(diseaseCell);

                    const dateCell = document.createElement('td');
                    dateCell.textContent = new Date(outbreak.date_reported).toLocaleDateString();
                    row.appendChild(dateCell);

                    const casesCell = document.createElement('td');
                    casesCell.textContent = outbreak.number_of_cases;
                    row.appendChild(casesCell);

                    const deathsCell = document.createElement('td');
                    deathsCell.textContent = outbreak.number_of_deaths;
                    row.appendChild(deathsCell);

                    // Add the row to the table body
                    tableBody.appendChild(row);

                    // Update totals
                    totalCases += outbreak.number_of_cases;
                    totalDeaths += outbreak.number_of_deaths;
                });

                // Add totals row at the bottom of the table
                const totalsRow = document.createElement('tr');
                totalsRow.innerHTML = `
                    <td colspan="3"><strong>Total</strong></td>
                    <td><strong>${totalCases}</strong></td>
                    <td><strong>${totalDeaths}</strong></td>
                `;
                tableBody.appendChild(totalsRow);
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }

    // Call the fetchOutbreakData function to load the data when the page is loaded
    fetchOutbreakData();
});
