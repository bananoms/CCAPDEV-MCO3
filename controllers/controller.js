const schemas = require('../models/schemas');
const Reservation = schemas.reservations;

exports.reservePageGet = (req,res) => {
    res.render('index');
}

exports.reservePagePost = async (req, res) => {
    console.log("HELLO2")
    try {
        // Log the incoming data for debugging
        console.log('Received data:', req.body);

        // Get the data from the request body
        const { lab, resDate, anon, selectedCells } = req.body;

        // Validate required fields
        if (!lab || !resDate || !selectedCells) {
            throw new Error('Missing required fields');
        }

        // Get the first selected cell for the seat
        const firstSelectedCell = selectedCells[Object.keys(selectedCells)[0]];
        if (!firstSelectedCell || !firstSelectedCell.seat) {
            throw new Error('No seat selected');
        }

        // Create new reservation document
        const newReservation = new Reservation({
            seat: firstSelectedCell.seat,
            lab: lab,
            reqDate: new Date(), // Current date/time
            resDate: new Date(resDate),
            anon: anon || false,
            reservedStud: 1
        });

        // Save the reservation
        await newReservation.save();

        // Redirect to confirmation page
        res.redirect('/confirmation');

    } catch (error) {
        console.error('Reservation creation error:', error);

    }
};


exports.confirmationPageGet = (req,res) => {
    res.render('confirmation');
}

exports.aboutPageGet = (req,res) => {
    res.render('about');
}

exports.loginPageGet = (req,res) => {
    res.render('log_in');
}

exports.loginPagePost = async (req,res,next) => {

}

exports.signupPageGet = (req,res) => {
    res.render('sign_up');
}

exports.signupPagePost = async (req,res,next) => {

}