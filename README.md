# Sift

Sift is a web scraping locally hosted application built using Electron and Express.

## APP DOES NOT CONTAIN A CERTIFICATE
- Apple will be unable to run this app (unless you use Gatekeeper.)
- Windows will throw a ton of warnings when you try to install.
- Linux will be fine.
  
## Table of Contents
- Installation
- Usage
- Features
- Packages used
- Contributing
- License

## Installation
Install the latest version's setup.exe or ->

1. Clone the repository:
    ```bash
    git clone https://github.com/point-o/Sift.git
    ```
2. Navigate to the project directory:
    ```bash
    cd Sift
    ```
3. Install the dependencies:
    ```bash
    npm install
    ```

## Usage

1. Start the application:
    ```bash
    npm start
    ```
2. Ensure port 3000 is open, this runs the backend.

## Features

- **Web Scraping**: Extract data from websites efficiently.
- **Electron Integration**: Run the application as a desktop app.
- **Express Backend**: Handle requests and manage data.

## Packages used

- **Cheerio**: For parsing and manipulating HTML.
- **Axios**: For making HTTP requests.
- **CSV Writer**: For writing data to CSV files.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request.

## License

This project is licensed under the MIT License. See the LICENSE file for details.
