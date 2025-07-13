const schemas = require('../models/schemas');
const Reservations = schemas.reservations;
const Profile = schemas.profile;

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

exports.signupPagePost = async (req, res, next) => {
    try {
        const { firstName, lastName, email, password, confirmPassword, type } = req.body;

        // Check if email is from dlsu.edu.ph domain
        if (!email.endsWith('@dlsu.edu.ph')) {
            return res.render('sign_up', {
                error: 'Please use your DLSU email address (@dlsu.edu.ph)'
            });
        }

        // Basic validation
        if (password !== confirmPassword) {
            return res.render('sign_up', {
                error: 'Passwords do not match'
            });
        }

        // Check if user already exists
        const existingUser = await Profile.findOne({ email });
        if (existingUser) {
            return res.render('sign_up', {
                error: 'Email already registered'
            });
        }

        // Create new user profile
        const newProfile = new Profile({
            firstName,
            lastName,
            email,
            type,
            hashedPassword: password,
            salt: 'dummy-salt',
            rem: false,
            img: '',
            bio: ''
        });

        await newProfile.save();

        res.redirect('/');
    } catch (error) {
        console.error('Signup error:', error);
        res.render('sign_up', {
            error: 'Error creating account. Please try again.'
        });
    }
};

exports.getReservations = async (req, res) => {
  try {
    const { lab, resDateStart } = req.query;
    let query = {};

    if (lab) query.lab = lab;

    if (resDateStart) {
      const date = new Date(resDateStart);
      const nextDate = new Date(date);
      nextDate.setUTCDate(date.getUTCDate() + 1);

      query['resDate.start'] = {
        $gte: date,
        $lt: nextDate
      };
    }

    const reservations = await Reservations.find(query).lean();

    res.json({
      success: true,
      reservations
    });

  } catch (error) {
    console.error('Error fetching reservations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch reservations'
    });
  }
};



