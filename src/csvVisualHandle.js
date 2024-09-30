document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('scrape-form');
    const renderButton = document.getElementById('render-csv');
    const downloadButton = document.getElementById('download-csv');
    const previewDiv = document.getElementById('csv-preview');

    // Handle form submission
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
    
    });

    // Handle render button click
    renderButton.addEventListener('click', async () => {
        try { //in build edition, 2 folders out for some reason? this is now a feature lol
            const response = await fetch('../../../titles.csv'); 
            if (!response.ok) throw new Error('Network response was not ok');

            const csvData = await response.text();
            displayCSVPreview(csvData);

        } catch (error) {
            console.error('Error fetching the CSV file:', error);
            previewDiv.innerHTML = '<p>Error fetching the CSV file.</p>';
        }
    });

    // Handle download button click
    downloadButton.addEventListener('click', () => {
        // Example CSV content for download
        const csvContent = `data:text/csv;charset=utf-8,Name,Age,Location\nJohn Doe,30,New York\nJane Smith,25,Los Angeles`;
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', 'data.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    // Function to display CSV preview
    function displayCSVPreview(csvData) {
        const rows = csvData.trim().split('\n'); // Trim whitespace and split by new lines
        if (rows.length === 0) {
            previewDiv.innerHTML = '<p>No data to display.</p>';
            return;
        }

        // Remove the header row
        const header = rows.shift(); // Optional: Store header if you want to display it separately

        // Join the remaining rows and format for display
        const formattedData = rows.join('\n');

        // Display the formatted data in a preformatted text area
        previewDiv.innerHTML = `<pre>${header}\n${formattedData}</pre>`; // Optionally include header
    }
});
