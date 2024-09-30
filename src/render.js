document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.sand');
  const textarea = document.querySelector('#urls');
  const filterInput = document.querySelector('#filter-keywords');
  const excludeInput = document.querySelector('#exclude-keywords');
  const downloadButton = document.getElementById('download-csv');
  const loadingBar = document.getElementById('loading-bar'); // Reference to loading bar

  if (!form) {
    console.error('Form element with class "sand" not found.');
    return;
  }

  if (!textarea) {
    console.error('Textarea element with ID "urls" not found.');
    return;
  }

  if (!filterInput) {
    console.error('Filter keywords input with ID "filter-keywords" not found.');
    return;
  }

  if (!excludeInput) {
    console.error('Exclude keywords input with ID "exclude-keywords" not found.');
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
          const blob = new Blob([csvData], { type: 'text/csv' });
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = 'data.csv'; // Update this as needed
          document.body.appendChild(link);
          link.click();
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
    event.preventDefault();

    // Show the loading bar
    if (loadingBar) {
      loadingBar.style.display = 'block';
    }

    const urlsString = textarea.value.trim();
    if (!urlsString) {
      console.warn('Textarea is empty.');
      return;
    }

    const urlsArray = urlsString.split(',').map(url => url.trim()).filter(url => url);
    if (urlsArray.length === 0) {
      console.warn('No valid URLs provided.');
      return;
    }

    const filterKeywords = filterInput.value.trim().split(',').map(keyword => keyword.trim()).filter(keyword => keyword);
    const excludeKeywords = excludeInput.value.trim().split(',').map(keyword => keyword.trim()).filter(keyword => keyword);

    console.log('Submitted URLs as array:', urlsArray);
    console.log('Filter keywords:', filterKeywords);
    console.log('Exclude keywords:', excludeKeywords);

    fetch('http://localhost:8080/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        urls: urlsArray,
        filterKeywords: filterKeywords,
        excludeKeywords: excludeKeywords
      }),
    })
      .then(response => {
        console.log('Response status:', response.status);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Response from server:', data);
        if (data.message) {
          alert(`Server response: ${data.message}`);
        } else {
          alert('Scraping has finished. You can now render the proper CSV.');
        }
      })
      .catch(error => {
        console.error('Error:', error);
      })
      .finally(() => {
        // Hide the loading bar when the request is finished
        if (loadingBar) {
          loadingBar.style.display = 'none';
        }
      });

    // Re-enable the textboxes after submission
    textarea.disabled = false;
    filterInput.disabled = false;
    excludeInput.disabled = false;
  });
});
