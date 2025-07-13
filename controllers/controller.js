const schemas = require('../models/schemas');
const Reservations = schemas.reservations;

exports.reservePageGet = (req,res) => {
    res.render('index');
}

exports.reservePagePost = async (req, res) => {
    try {
        console.log('Received data:', req.body);

        if (!req.body.reservation) {
            throw new Error('Invalid request format: missing reservation data');
        }

        const { seat, lab, reqDate, resDate, anon } = req.body.reservation;

        // Validate each required field individually for better error messages
        if (!seat) throw new Error('Seat is required');
        if (!lab) throw new Error('Lab is required');
        if (!resDate || !resDate.start || !resDate.end) throw new Error('Valid reservation dates are required');

        const newReservation = new Reservations({
            seat: seat,
            lab: lab,
            reqDate: new Date(reqDate),
            resDate: {
                start: new Date(resDate.start),
                end: new Date(resDate.end)
            },
            anon: anon || false,
        });

        await newReservation.save();

        // Send JSON response instead of redirect
        res.status(200).json({
            success: true,
            message: 'Reservation created successfully'
        });

    } catch (error) {
        console.error('Reservation creation error:', error);
        res.status(400).json({
            success: false,
            error: error.message,
            received: req.body
        });
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