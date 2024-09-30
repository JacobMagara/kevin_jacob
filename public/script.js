document.addEventListener('DOMContentLoaded', () => {
    // Detect which page is loaded and call the appropriate function
    const page = document.body.getAttribute('data-page');

    if (page === 'home') {
        fetchOutbreaks();
    } else if (page === 'view_data') {
        fetchAllData();
    }
});

// Function to fetch and display recent outbreaks on the home page
function fetchOutbreaks() {
    fetch('/api/incidents')
        .then(response => response.json())
        .then(data => {
            const tableBody = document.querySelector('#outbreak-table tbody');
            tableBody.innerHTML = ''; // Clear existing table data

            data.forEach(incident => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${incident.region}</td>
                    <td>${incident.country}</td>
                    <td>${incident.disease_name}</td>
                    <td>${new Date(incident.date_reported).toLocaleDateString()}</td>
                    <td>${incident.number_of_cases}</td>
                    <td>${incident.number_of_deaths}</td>
                `;
                tableBody.appendChild(row);
            });
        })
        .catch(err => console.error('Error fetching outbreaks:', err));
}

// Function to fetch and display all data on the view data page
function fetchAllData() {
    fetch('/api/incidents')
        .then(response => response.json())
        .then(data => {
            const tableBody = document.querySelector('#data-table tbody');
            tableBody.innerHTML = ''; // Clear existing table data

            data.forEach(record => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${record.region}</td>
                    <td>${record.country}</td>
                    <td>${record.disease_name}</td>
                    <td>${new Date(record.date_reported).toLocaleDateString()}</td>
                    <td>${record.number_of_cases}</td>
                    <td>${record.number_of_deaths}</td>
                    <td>${record.number_vaccinated || 'N/A'}</td>
                `;
                tableBody.appendChild(row);
            });
        })
        .catch(err => console.error('Error fetching data:', err));
}

// Additional utility functions can be added here as needed for other pages or features
