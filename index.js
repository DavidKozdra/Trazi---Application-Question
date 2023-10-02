const express = require('express');
const fs = require('fs');

const app = express();
const port = 5555;

const populationData = {}; // In-memory data store
const csvFilePath = 'city_populations.csv';

// Load data from the CSV file and store it in memory
fs.readFile(csvFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading CSV file:', err);
      return;
    }
  
    const rows = data.split('\n');
    for (const row of rows) {
      const [city, state, population] = row.split(',');
      const key = `${state.trim().toLowerCase()}-${city.trim().toLowerCase()}`;
      populationData[key] = parseInt(population);
    }  
  });
  
app.use(express.json());

app.get('/api/population/state/:state/city/:city', (req, res) => {
  const state = req.params.state.toLowerCase();
  const city = req.params.city.toLowerCase();
  const key = `${state}-${city}`;

  if (populationData[key]) {
    res.status(200).json({ population: populationData[key] });
  } else {
    res.status(400).json({ error: 'State/city not found' });
  }

});

app.put('/api/population/state/:state/city/:city', (req, res) => {
  const state = req.params.state.toLowerCase();
  const city = req.params.city.toLowerCase();
  const key = `${state}-${city}`;
  const {population} = req.body;
    let statusCode;
  if (!population || isNaN(population)) {
    console.log(population)
    res.status(400).json({ error: 'Invalid population data' });
    return;
  }

if (populationData[key]) {
     statusCode = 200;
  
    const rows = [];
    for (const key in populationData) {
      const [state, city] = key.split('-');
      const population = populationData[key];
      rows.push(`${city},${state},${population}`);
    }
  
    fs.writeFileSync(csvFilePath, rows.join('\n'));
  
    res.status(200).json({ message: 'Data updated successfully' });
  } else {
     statusCode = 201;
  
    const rows = [];
    for (const key in populationData) {
      const [state, city] = key.split('-');
      const population = populationData[key];
      rows.push(`${city},${state},${population}`);
    }
  
    fs.writeFileSync(csvFilePath, rows.join('\n'));
  
    res.status(201).json({ message: 'Data added and updated successfully' });
  }
  res.status(statusCode).json({ message: 'Population data '+ (statusCode == 200  ? "created": "updated")});
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
