exports.homePageGet = (req,res) => {
    res.render('index');
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