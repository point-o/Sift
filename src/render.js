document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.sand');
  const textarea = document.querySelector('#urls');
  const downloadButton = document.getElementById('download-csv');

  if (!form) {
    console.error('Form element with class "sand" not found.');
    return;
  }

  if (!textarea) {
    console.error('Textarea element with ID "urls" not found.');
    return;
  }

  if (downloadButton) {
    downloadButton.addEventListener('click', () => {
      fetch('../titles.csv')
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.text();
        })
        .then(csvData => {
          // Create a Blob from the CSV data
          const blob = new Blob([csvData], { type: 'text/csv' });

          // Create a link element
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = '(insert-your-name).csv';

          // Append the link to the document and click it to trigger the download
          document.body.appendChild(link);
          link.click();

          // Clean up
          document.body.removeChild(link);
        })
        .catch(error => {
          console.error('Error fetching the CSV file:', error);
        });
    });
  } else {
    console.error('Download button with ID "download-csv" not found.');
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault(); // Prevent the default form submission behavior

    const urlsString = textarea.value.trim(); // Get the value from the textarea and trim whitespace
    if (!urlsString) {
      console.warn('Textarea is empty.');
      return;
    }

    const urlsArray = urlsString.split(",").map(url => url.trim()).filter(url => url); // Split by comma, trim whitespace, and remove empty values
    if (urlsArray.length === 0) {
      console.warn('No valid URLs provided.');
      return;
    }

    console.log('Submitted URLs as array:', urlsArray); // Log the array of URLs to the console

    // Send the URLs array to the backend server
    fetch('http://localhost:3000/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ urls: urlsArray }),
    })
      .then(response => {
        console.log('Response status:', response.status);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json(); // Parse the response as JSON
      })
      .then(data => {
        console.log('Response from server:', data);
        // Handle the server's response
        if (data.message) {
          alert(`Server response: ${data.message}`);
        } else {
          alert('Scraping has finished :)');
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
  });
});
