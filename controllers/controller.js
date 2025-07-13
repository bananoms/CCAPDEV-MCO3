exports.reservePageGet = (req,res) => {
    res.render('index');
}

exports.reservePagePost = async (req,res,next) => {

    res.redirect('/confirmation');
}

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