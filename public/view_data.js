// document.addEventListener('DOMContentLoaded', () => {
//     fetchAllData();
// });

// // Function to fetch and display all data on the view data page
// function fetchAllData() {
//     fetch('/api/incidents')
//         .then(response => response.json())
//         .then(data => {
//             const tableBody = document.querySelector('#data-table tbody');
//             tableBody.innerHTML = ''; // Clear existing table data

//             data.forEach(record => {
//                 const row = document.createElement('tr');
//                 row.innerHTML = `
//                     <td>${record.region}</td>
//                     <td>${record.country}</td>
//                     <td>${record.disease_name}</td>
//                     <td>${new Date(record.date_reported).toLocaleDateString()}</td>
//                     <td>${record.number_of_cases}</td>
//                     <td>${record.number_of_deaths}</td>
//                     <td>${record.number_vaccinated || 'N/A'}</td>
//                 `;
//                 tableBody.appendChild(row);
//             });
//         })
//         .catch(err => console.error('Error fetching data:', err));
// }

document.addEventListener('DOMContentLoaded', () => {
    fetchAllData();
});

// Function to fetch and display all data on the view data page
function fetchAllData() {
    const userId = 1; // Use the actual user ID as needed
    fetch(`/api/view_data/${userId}`)
        .then(response => response.json())
        .then(data => {
            const tableBody = document.querySelector('#data-table tbody');
            tableBody.innerHTML = ''; // Clear existing table data

            data.forEach(record => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${record.location || 'N/A'}</td>
                    <td>${record.disease_name}</td>
                    <td>${new Date(record.date_reported).toLocaleDateString()}</td>
                    <td>${record.number_of_cases !== null ? record.number_of_cases : 'N/A'}</td>
                    <td>${record.number_of_deaths !== null ? record.number_of_deaths : 'N/A'}</td>
                    <td>${record.number_vaccinated !== null ? record.number_vaccinated : 'N/A'}</td>
                `;
                tableBody.appendChild(row);
            });
        })
        .catch(err => console.error('Error fetching data:', err));
}

