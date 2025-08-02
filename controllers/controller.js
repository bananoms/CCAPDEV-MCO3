const schemas = require('../models/schemas');
const Reservations = schemas.reservations;
const Profile = schemas.profile;

// For Cloudinary usage of pictures from cloud
const cloudinary = require('cloudinary');
const multer = require('multer');

const storage = multer.diskStorage({});

const upload = multer({ storage });

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

exports.upload = upload.single("image");

exports.pushToCloudinary = (req, res, next) => {
    if(req.file) {
        cloudinary.uploader.upload(req.file.path)
            .then((result) => {
                req.body.image = result.public_id;
                next();
            })
    } else {
        next();
    }
}
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


exports.loginPagePost = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.render('log_in', {
                error: 'Please provide both email and password'
            });
        }

        const user = await schemas.profile.findOne({ email }).exec();

        if (!user) {
            return res.render('log_in', {
                error: 'Invalid email or password',
                email
            });
        }

        const bcrypt = require('bcrypt');
        const match = await bcrypt.compare(password, user.hashedPassword);

        if (!match) {
            return res.render('log_in', {
                error: 'Invalid email or password',
                email
            });
        }

        // ✅ Set session
        req.session.userId = user._id;
        req.session.userType = user.type;

        // ✅ Optionally update lastLogin
        user.lastLogin = new Date();
        await user.save();

        // ✅ Redirect based on role
        if (user.type === 'Admin') {
            return res.redirect('/admin');
        } else if (user.type === 'Lab Technician') {
            return res.redirect('/technician-dashboard'); // Create later
        } else {
            return res.redirect(`/user/${user._id}`);
        }

    } catch (error) {
        console.error('Login error:', error);
        res.render('log_in', {
            error: 'An error occurred during login',
            email: req.body.email
        });
    }
};


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

        // Possibly for MCO3
        // Only allow 'student' type during sign-up
        // if (type !== 'student') {
        //     return res.render('sign_up', {
        //         error: 'Only student accounts can be created through sign-up'
        //     });
        // }

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
      // Parse the date (this will be interpreted as local date)
      const localDate = new Date(resDateStart);
      
      // For UTC+8, we need to find the UTC range that corresponds to the full day in UTC+8
      // Start of day in UTC+8 = subtract 8 hours from UTC
      const startDate = new Date(localDate);
      startDate.setUTCHours(0 - 8, 0, 0, 0); // This gives us 16:00 UTC of previous day
      
      // End of day in UTC+8 = start of next day minus 8 hours
      const endDate = new Date(localDate);
      endDate.setUTCDate(localDate.getUTCDate() + 1);
      endDate.setUTCHours(0 - 8, 0, 0, 0); // This gives us 16:00 UTC of the same day
      
      console.log(`Searching for reservations on ${resDateStart} (UTC+8)`);
      console.log(`UTC range: ${startDate.toISOString()} to ${endDate.toISOString()}`);
      
      query['resDate.start'] = {
        $gte: startDate,
        $lt: endDate
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
exports.UserGet = async (req, res) => {
    try {
        const userId = req.params.id;
        
        // Validate if the ID is a valid MongoDB ObjectId
        if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).render('error', {
                message: 'Invalid user ID format',
                error: { status: 400 }
            });
        }

        // Find the user profile by ID, excluding sensitive fields
        const userProfile = await Profile.findById(userId).select('-hashedPassword -salt');
        
        if (!userProfile) {
            return res.status(404).render('error', {
                message: 'User profile not found',
                error: { status: 404 }
            });
        }

        // Fetch user's reservations (assuming you have a Reservation model)
        // Replace 'Reservation' with your actual model name
        let userReservations = [];
        try {
            // Assuming reservations have a 'userId' field that references the user
            userReservations = await Reservation.find({ userId: userId })
                .populate('labId', 'name') // If you have lab references
                .sort({ reservationDate: -1 }) // Sort by most recent
                .limit(10); // Limit to recent 10 reservations
        } catch (reservationError) {
            console.log('No reservations found or Reservation model not available:', reservationError.message);
            // Continue without reservations if model doesn't exist
        }

        // Format reservations for the mixin
        const formattedReservations = userReservations.map(reservation => ({
            id: reservation._id,
            name: reservation.labName || reservation.labId?.name || `Reservation ${reservation._id}`,
            date: reservation.reservationDate,
            status: reservation.status || 'confirmed'
        }));

        // Render the profile page with the mixin data
        res.render('user_profile', {
            title: `${userProfile.firstName} ${userProfile.lastName} - Profile`,
            profile: {
                id: userProfile._id,
                firstName: userProfile.firstName,
                lastName: userProfile.lastName,
                img: userProfile.img,
                email: userProfile.email,
                type: userProfile.type,
                profilePicture: userProfile.profilePicture,
                namePronunciation: userProfile.namePronunciation,
                biography: userProfile.biography,
                socialLinks: userProfile.socialLinks || {},
                createdAt: userProfile.createdAt
            },
            userReservations: formattedReservations,
            currentUserId: req.session?.userId || null // For checking if viewing own profile
        });

    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).render('error', {
            message: 'Error loading user profile',
            error: error
        });
    }
};
exports.UsersSearchGet = async (req, res) => {
    try {
        const searchTerm = req.params.search_term;        
        // Rest of your code remains the same...
        const searchQuery = {
            $or: [
                { firstName: { $regex: searchTerm, $options: 'i' } },
                { lastName: { $regex: searchTerm, $options: 'i' } },
                { email: { $regex: searchTerm, $options: 'i' } },
                { type: { $regex: searchTerm, $options: 'i' } },
            ]
        };
        
        const profiles = await Profile.find(searchQuery).select('-hashedPassword -salt');
        
        res.render('search_users_results', {
            title: `Search Results for "${searchTerm}"`,
            profiles: profiles,
            searchTerm: searchTerm,
            resultsCount: profiles.length
        });
    } catch (error) {
        console.error('Error searching profiles:', error);
        res.status(500).render('error', {
            message: 'Error searching profiles',
            error: error
        });
    }
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



