const express = require('express');
const axios = require('axios');
const app = express();

app.set('view engine', 'pug');
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

require('dotenv').config(); 

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// * Please DO NOT INCLUDE the private app access token in your repo. Don't do this practicum in your normal account.
const PRIVATE_APP_ACCESS = process.env.ACCESS_TOKEN;

// Testing
app.get('/contacts', async (req, res) => {
    const contacts = 'https://api.hubspot.com/crm/v3/objects/contacts';
    const headers = {
        Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
        'Content-Type': 'application/json'
    }
    try {
        const resp = await axios.get(contacts, { headers });
        console.log("Full Response:", resp.data.results);
        const data = resp.data.results;
        res.render('updates', { title: 'Contacts | HubSpot APIs', data });      
    } catch (error) {
        console.error(error);
    }
});

// TODO: ROUTE 1 - Create a new app.get route for the homepage to call your custom object data. Pass this data along to the front-end and create a new pug template in the views folder.

// * Code for Route 1 
app.get('/', async (req, res) => {
    const cars = 'https://api.hubapi.com/crm/v3/objects/cars/?properties=car_name,brand,horse,horsepower,registration_number';

    const headers = {
        Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
        'Content-Type': 'application/json'
    };
    try {
        const response = await axios.get(cars, { headers });
        console.log("Full Response:", response.data.results);
        const data = response.data.results;
        res.render('homepage', { title: 'Classic Cars Collection | HubSpot Practicum', data });

    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching cars data');
    }

});


// TODO: ROUTE 2 - Create a new app.get route for the form to create or update new custom object data. Send this data along in the next route.

// * Code for Route 2 
// TODO: ROUTE 2 - Render form page for creating/updating custom object data.

app.get('/update-cobj/:id?', async (req, res) => {
    try {
        let car = null;
        const headers = {
            Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
            'Content-Type': 'application/json'
        };
        
        if (req.params.id) {
            const response = await axios.get(
                `https://api.hubapi.com/crm/v3/objects/cars/${req.params.id}?properties=car_name,brand,horse,horsepower,registration_number`,
                { headers }
            );
            car = response.data;
        }
        
        res.render('updates', { 
            title: car ? 'Update Car' : 'Add New Car',
            car
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).send('Error loading form');
    }
});


// TODO: ROUTE 3 - Create a new app.post route for the custom objects form to create or update your custom object data. Once executed, redirect the user to the homepage.

// * Code for ROUTE 3

// POST route for create/update
app.post('/update-cobj/:id?', async (req, res) => {
    const carData = {
        properties: {
            "car_name": req.body.car_name,
            "registration_number": req.body.registration_number,
            "brand": req.body.brand,
            "horsepower": parseInt(req.body.horsepower)
        }
    };

    const headers = {
        Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
        'Content-Type': 'application/json'
    };

    const carUpdateUrl = `https://api.hubapi.com/crm/v3/objects/cars/${req.params.id}`;
    const carCreateUrl = 'https://api.hubapi.com/crm/v3/objects/cars';
    try {
        if (req.params.id) {
            // Update existing car (PATCH)
            await axios.patch( carUpdateUrl, carData, { headers } );
        } else {
            // Create new car (POST)
            await axios.post( carCreateUrl, carData, { headers } );
        }
        res.redirect('/');
    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
        res.status(500).send('Error saving car');
    }
});

// Extra To complete CRUD : ROUTE 3 - Create a new app.post route to delete the custom objects records.

// * Code for ROUTE 4
// DELETE route for HubSpot custom objects
app.delete('/delete/:id', async (req, res) => {
    const headers = {
        Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
        'Content-Type': 'application/json'
    };
    const carDeleteUrl = `https://api.hubapi.com/crm/v3/objects/cars/${req.params.id}`;
    console.log('carDeleteUrl:', carDeleteUrl);
    try {
        await axios.delete( carDeleteUrl, { headers } );
        res.sendStatus(204);
    } catch (error) {
        console.error('Delete Error:', error.response?.data || error.message);
        res.status(500).send('Error deleting car');
    }
});

// * Localhost
app.listen(3000, () => console.log('Listening on http://localhost:3000'));