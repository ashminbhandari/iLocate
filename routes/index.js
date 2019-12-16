var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser'); //Body parser to parse the request body
var urlencodedParser = bodyParser.urlencoded({ extended: false }); //Form parser





//Setting up the geocoder
var NodeGeocoder = require('node-geocoder');
var geocoder = NodeGeocoder({
    provider: 'opencage',
    apiKey: '40a475a5b3ba4c05a52be15884838482'
});

//Importing mongoose for mongo operations and connecting to databse
const mongoose = require('mongoose');

//Databse URL to connect to
const url = 'mongodb://localhost:27017/iLocate';

//Building a schema for the contacts to be added to the collection
var contactsSchema = new mongoose.Schema({
    fname: String,
    lname: String,
    street: String,
    city: String,
    state: String,
    zip: String,
    phone: String,
    email: String,
    salutation: String,
    contactByMail: Boolean,
    contactByPhone: Boolean,
    contactByEmail: Boolean,
    latitude: String,
    longitude: String
});

//Compile schema to model
var contact = mongoose.model('contact', contactsSchema, 'contacts');


var ensureLoggedIn = function(req, res, next) {
    if ( req.user ) {
        next();
    }
    else {
        res.redirect("/");
    }
}

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index');
});


/*GET contacts page*/
router.get('/contacts', ensureLoggedIn, function(req, res, next) {
    //Connecting to iLocate database
    mongoose.connect(url, {useNewUrlParser: true});

    //Establishing connection and checking for error
    var db = mongoose.connection;

    db.on('error', console.error.bind(console, 'Error in database connection.'));

    db.once('open', function () {
        console.log("Database is open.");
        contact.find({}, function(err,contacts){
            res.send(contacts);
        });
    });
});

/* POST check page. */
router.post('/delete', ensureLoggedIn, urlencodedParser, function(req, res, next) {
    contact.remove({ _id: req.body.id }, function(err) {
        if (!err) {
            res.send("success");
        }
        else {
            console.error(err);
        }
    });
});


/* POST check page. */
router.post('/mailer', urlencodedParser, function(req, res, next) {
    //Connecting to iLocate database
    mongoose.connect(url, {useNewUrlParser: true});

    //Establishing connection and checking for error
    var db = mongoose.connection;
    db.on('error', console.error.bind(console, 'Error in database connection.'));
    db.once('open', function() {
        console.log("Database is open.");

        //Getting the contact preference of the user as booleans
        var contactByPhone = false;
        var contactByEmail = false;
        var contactByMail = false;

        if(req.body.contactByPhone == "True") {
            contactByPhone = true;
        }

        if(req.body.contactByEmail == "True") {
            contactByEmail = true;
        }

        if(req.body.contactByMail == "True") {
            contactByMail = true;
        }

        //Address to geocode
        var address = req.body.street + ', ' + req.body.city + ', ' + req.body.state + ', '+ req.body.zip;

        //The contact object to be saved
        var contactToSave = new contact({
            fname: req.body.fname,
            lname: req.body.lname,
            street: req.body.street,
            city: req.body.city,
            state: req.body.state,
            zip: req.body.zip,
            phone: req.body.phone,
            email: req.body.email,
            salutation: req.body.salutation,
            contactByMail: contactByMail,
            contactByPhone: contactByPhone,
            contactByEmail: contactByEmail,
            latitude: "",
            longitude: ""
        });


        //Geocoding the address using promise
        geocoder.geocode(address)
            .then(function(response) {
                //Setting the latitude and longitude of the contact to be saved as gotten from the response of the geocoder
                if(response[0].latitude != undefined || response[0].longitude != undefined) {
                contactToSave.latitude = response[0].latitude;
                contactToSave.longitude = response[0].longitude;
                }
                else {
                    contactToSave.latitude = "";
                    contactToSave.longitude ="";
                }

                //Saving model to database here because we have to wait for the latitude and longitude to be resolved by this async call
                contactToSave.save(function (err, contact) {
                    if (err) return console.error(err);
                    else {
                        console.log(contact.fname + " " + contact.lname + "'s details has been saved to the contacts collection.");
                        res.send(contact.fname + ' ' + contact.lname);
                    }
                });
            })
            .catch(function(err) {
                console.log(err);
            });
    })
});

/* POST check page. */
router.post('/update', ensureLoggedIn, urlencodedParser, function(req, res, next) {
    //Getting the contact preference of the user as booleans
    var contactByPhone = false;
    var contactByEmail = false;
    var contactByMail = false;

    if(req.body.contactByPhone == "True") {
        contactByPhone = true;
    }

    if(req.body.contactByEmail == "True") {
        contactByEmail = true;
    }

    if(req.body.contactByMail == "True") {
        contactByMail = true;
    }

    //Generate a new latitude and longitude based on new address if one was entered
    address = req.body.street + ', ' + req.body.city + ', ' + req.body.state + ', ' + req.body.zip;
    //Geocoding the address using promise
    geocoder.geocode(address)
        .then(function(response) {
            var lat="";
            var lon="";
            //Setting the latitude and longitude of the contact to be saved as gotten from the response of the geocoder
            if(response[0].latitude != undefined || response[0].longitude != undefined) {
                lat = response[0].latitude;
                lon = response[0].longitude;
            }
            contact.findByIdAndUpdate(req.body.contactID,{$set:{fname:req.body.fname,lname:req.body.lname, street:req.body.street, city:req.body.city, state:req.body.state, zip:req.body.zip, phone:req.body.phone,
                    email:req.body.email, salutation:req.body.salutation, contactByMail:contactByMail, contactByPhone:contactByPhone, contactByEmail:contactByEmail, latitude:lat, longitude:lon}}
            ,{new:true}, function(err) {
                if (!err) {
                    res.send(req.body.fname + ' ' + req.body.lname);
                } else {
                    console.error(err);
                }
            });

        })
        .catch(function(err) {
            console.log(err);
        });
});

/* POST check page. */
router.post('/fsearch', ensureLoggedIn, urlencodedParser, function(req, res, next) {
    // executes, name LIKE john and only selecting the "name" and "friends" fields
    var allResults;
    contact.find(
        {$or:[{"fname": { "$regex": req.body.query, "$options": "i" }},{"lname":{"$regex": req.body.query, "$options": "i" } }]},
        function(err,docs) {
            res.send(docs);
        }
    );

});




module.exports = router;
