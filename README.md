# Shortlet Backend Assessment

## Overview
This project is a REST API developed with NestJS and TypeScript, designed to integrate and manage data from the REST Countries API. It emphasizes robust data management, secure API design, and performance optimization.

## Setup Instructions

### Prerequisites
Ensure you have the following installed on your local machine:

- Node.js (v18.x or later)
- npm (v7.x or later)
- TypeScript (v5.1.3 or later)

### Environment Configuration

1. **Clone the Repository:**

   ```bash
   $ git clone git@github.com:emmadedayo/shortlet.git
   $ cd shortlet
   ```

2. **Install Dependencies:**

   ```bash
   $ make install
   ```

3. **Create a `.env` File:**

   Create a `.env` file in the root directory and include the following environment variables:

   ```
   COUNTRY_BASE_URL=https://restcountries.com/v3.1
   TIME_OUT=60000
   PORT=3010
   ```

### Running the Application

1. **Start the Application:**

   ```bash
   # For development
   $ make run
   ```

2. **Access the API:**

   The API will be available at [http://localhost:3010](http://localhost:3010) after running the command above.

### Running Tests

- **Unit Tests:**

  ```bash
  $ make test
  ```

- **Test Coverage:**

  ```bash
  $ make test-coverage
  ```

## Swagger Documentation

Explore the API endpoints and view detailed documentation via Swagger UI at [http://localhost:3010/documentation](http://localhost:3010/documentation). This interface provides interactive access to the API's operations and responses.

## API Endpoints

- **GET /countries:** Retrieve a list of countries with pagination and optional filtering by region or population size.
- **GET /countries/:countryId:** Fetch detailed information for a specific country, including languages, population, area, and neighboring countries.
- **GET /regions:** Obtain a list of regions and their constituent countries, with aggregated data such as total population.
- **GET /languages:** Access a list of languages and the countries where they are spoken, including the global number of speakers for each language.
- **GET /statistics:** Provide aggregated statistics, including the total number of countries, the largest by area, the smallest by population, and the most widely spoken language.

## Implementation Approach

### Data Integration
- **Data Retrieval:** The service fetches data from the REST Countries API and processes it to provide useful information through the API endpoints.
- **Caching:** Implemented caching to reduce the frequency of API requests and improve performance.

### Security
- **Error Management:** Robust error handling is in place to manage issues such as data inconsistencies and API unavailability.
- **Rate Limiting:** Applied rate limiting to prevent misuse and maintain API responsiveness.

### Performance
- **Pagination:** Incorporated pagination to handle large datasets efficiently.
- **Filtering and Sorting:** Enabled filtering by region and population size, and sorting results alphabetically.

## Interesting Challenges and Features

### Challenges
- **Data Integrity:** Ensuring the accuracy and reliability of data fetched from the REST Countries API.
- **Performance Tuning:** Developing efficient caching and data processing strategies to enhance performance.

### Features
- **In-Depth Information:** Provides comprehensive details on countries, including languages, population, borders, and geographical coordinates.
- **Aggregated Insights:** Delivers consolidated statistics and data for regions and languages to enhance the API's usability.

## Aspects I Am Especially Proud Of
- **Robust Error Handling:** The service effectively manages various error scenarios, delivering clear and meaningful error messages.
- **Optimized Data Handling:** Utilizes caching and efficient data processing methods to ensure fast and reliable responses.
- **Thorough Testing:** Implements comprehensive unit and integration tests to verify the functionality and reliability of the service across a wide range of scenarios.
```
# shortlet
