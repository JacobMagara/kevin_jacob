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

                // Loop through the incidents and create a table row for each
                outbreaks.forEach(outbreak => {
                    const row = document.createElement('tr');

                    const regionCell = document.createElement('td');
                    regionCell.textContent = outbreak.location;
                    row.appendChild(regionCell);

                    const countryCell = document.createElement('td');
                    countryCell.textContent = outbreak.location;  // Assuming location is both region and country
                    row.appendChild(countryCell);

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

                    // Append the row to the table
                    tableBody.appendChild(row);
                });
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }

    // Call the fetchOutbreakData function to load the data when the page is loaded
    fetchOutbreakData();
});
