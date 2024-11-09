document.addEventListener('DOMContentLoaded', () => {
    fetchAllData();
});

// Function to fetch and display all data on the view data page
function fetchAllData() {
    const userId = 1; // Use the actual user ID as needed
    fetch(`/api/view_data/${userId}`)
        .then(response => response.json())
        .then(data => {
            const { incidences, vaccinations } = data; // Destructure the response

            // Get table bodies
            const incidencesTableBody = document.querySelector('#incidences-table tbody');
            const vaccinationsTableBody = document.querySelector('#vaccinations-table tbody');

            // Clear existing data
            incidencesTableBody.innerHTML = '';
            vaccinationsTableBody.innerHTML = '';

            // Initialize totals
            let totalCases = 0;
            let totalDeaths = 0;
            let totalVaccinated = 0;

            // Display incidences
            incidences.forEach(record => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${record.location}</td>
                    <td>${record.disease_name}</td>
                    <td>${new Date(record.date_reported).toLocaleDateString()}</td>
                    <td>${record.number_of_cases}</td>
                    <td>${record.number_of_deaths}</td>
                `;
                incidencesTableBody.appendChild(row);

                // Update totals
                totalCases += record.number_of_cases;
                totalDeaths += record.number_of_deaths;
            });

            // Add totals row for incidences
            const totalsRow = document.createElement('tr');
            totalsRow.innerHTML = `
                <td colspan="3"><strong>Total</strong></td>
                <td><strong>${totalCases}</strong></td>
                <td><strong>${totalDeaths}</strong></td>
            `;
            incidencesTableBody.appendChild(totalsRow);

            // Display vaccinations
            vaccinations.forEach(record => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${record.location}</td>
                    <td>${record.disease_name}</td>
                    <td>${new Date(record.date_of_vaccination).toLocaleDateString()}</td>
                    <td>${record.number_of_vaccinated}</td>
                `;
                vaccinationsTableBody.appendChild(row);

                // Update total vaccinated
                totalVaccinated += record.number_of_vaccinated;
            });

            // Add totals row for vaccinations
            const vaccinationTotalsRow = document.createElement('tr');
            vaccinationTotalsRow.innerHTML = `
                <td colspan="3"><strong>Total</strong></td>
                <td><strong>${totalVaccinated}</strong></td>
            `;
            vaccinationsTableBody.appendChild(vaccinationTotalsRow);
        })
        .catch(err => console.error('Error fetching data:', err));
}
