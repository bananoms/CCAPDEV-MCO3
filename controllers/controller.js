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
        
        // Send JSON response with booking ID
        res.status(200).json({
            success: true,
            message: 'Reservation created successfully',
            bookingId: newReservation._id  // Add this line
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

exports.confirmationPageGet = async (req, res) => {
    try {
        const bookingId = req.params.id;
        
        // Validate MongoDB ObjectId format
        if (!bookingId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).render('error', { 
                error: 'Invalid booking ID format' 
            });
        }
        
        // Find the reservation in database
        const reservation = await Reservations.findById(bookingId);
        
        if (!reservation) {
            return res.status(404).render('error', { 
                error: 'Reservation not found' 
            });
        }
        
        // Render confirmation page with reservation data
        res.render('confirmation', { reservation });
    } catch (error) {
        console.error('Error fetching reservation:', error);
        res.status(500).render('error', { 
            error: 'Error retrieving reservation details' 
        });
    }
};

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
exports.UserGet = async (req,res) => {
    console.log("user get")
}

exports.adminPageGet = (req,res) => {
    res.render('admin');
}

exports.adminEditReserve = async (req,res) => {
    try {
        const reservationId = req.params.id;
        
        // Replace 'Reservation' with your actual model/collection name
        const reservation = await Reservations.findById(reservationId);
        
        if (!reservation) {
            return res.status(404).render('error.pug', { 
                message: 'Reservation not found' 
            });
        }
        
        res.render('edit.pug', { 
            reservation: reservation 
        });
        
    } catch (error) {
        console.error('Error fetching reservation:', error);
        res.status(500).render('error.pug', { 
            message: 'Server error' 
        });
    }
}

exports.adminEditUpdate = async (req, res) => {
    try {
        const reservationId = req.params.id;
        const updatedReservation = req.body.reservation;
        
        // Validate that reservation data exists
        if (!updatedReservation) {
            return res.status(400).json({
                success: false,
                error: 'No reservation data provided'
            });
        }
        
        // Find and update the reservation
        // Replace 'Reservation' with your actual model name
        const reservation = await Reservations.findByIdAndUpdate(
            reservationId,
            updatedReservation,
            { 
                new: true,           // Return the updated document
                runValidators: true  // Run schema validations
            }
        );
        
        if (!reservation) {
            return res.status(404).json({
                success: false,
                error: 'Reservation not found'
            });
        }
        
        // Return success response
        res.json({
            success: true,
            message: 'Reservation updated successfully',
            reservation: reservation
        });
        
    } catch (error) {
        console.error('Error updating reservation:', error);
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                error: 'Validation failed: ' + error.message
            });
        }
        
        // Handle other errors
        res.status(500).json({
            success: false,
            error: 'Server error occurred while updating reservation'
        });
    }
};
exports.adminEditPageGet = async (req, res) => {
    try {
        // Fetch all reservations from database
        const reservations = await Reservations.find({})
            .populate('user') // If you have user references
            .sort({ reqDate: -1 }); // Sort by request date, newest first
        
        res.render('admin_edit_delete_reservation', { reservations });
    } catch (error) {
        console.error('Error fetching reservations:', error);
        res.status(500).render('error', { 
            error: 'Error loading reservations' 
        });
    }
};
exports.adminDelete = async (req, res) => {
    try {
        const reservationId = req.params.id;
        
        // Validate MongoDB ObjectId format
        if (!reservationId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid reservation ID format'
            });
        }
        
        // Find and delete the reservation
        const deletedReservation = await Reservations.findByIdAndDelete(reservationId);
        
        if (!deletedReservation) {
            return res.status(404).json({
                success: false,
                error: 'Reservation not found'
            });
        }
        
        // Return success response
        res.json({
            success: true,
            message: 'Reservation deleted successfully',
            deletedId: reservationId
        });
        
    } catch (error) {
        console.error('Error deleting reservation:', error);
        res.status(500).json({
            success: false,
            error: 'Error deleting reservation'
        });
    }
};



