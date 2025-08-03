const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const profileSchema = new Schema ({
    firstName: {type:String, required:true},
    lastName: {type:String, required:true},
    img: {type:String},
    type: {type:String, required:true, enum:['Student', 'Lab Technician', 'Admin']},
    bio: {type:String},
    email: {type:String, required:true},
    salt: { type: String},
    hashedPassword: { type: String, required: true },
    rem: {type:Boolean, required:true},
    lastLogin: {type:Date, default:Date.now}
});

const reservationsSchema = new Schema ({
    seat: {type:String, required:true},
    lab: {type:String, required:true},
    reqDate: {type:Date, required:true, default:Date.now},
    resDate: {
        start: {type: Date, required: true},
        end: {type: Date, required: true}
    }, //Time frame of reservation
    anon: {type:Boolean, required:true},
    user: {type:Schema.Types.ObjectId, ref:'profile'},
    reservedStud: {type:Number}
});

const errorLogSchema = new mongoose.Schema({
    errorMessage: {
        type: String,
        required: true
    },
    errorStack: String,
    errorCode: Number,
    path: String,
    method: String,
    timestamp: {
        type: Date,
        default: Date.now
    },
    additionalInfo: mongoose.Schema.Types.Mixed
});


const Profile = mongoose.model("Profile", profileSchema);
const Reservations = mongoose.model("Reservations", reservationsSchema);
const ErrorLog = mongoose.model("ErrorLog", errorLogSchema);

module.exports = {
    profile: Profile,
    reservations: Reservations,
    errorLog: ErrorLog
};
