const router = require ('express').Router();
const passport = require('passport');

//Models
const User = require('../models/User');

//Register a new user
router.get('/users/signup', (req, res) =>{
  res.render ('users/signup');
});

router.post('/users/signup', async (req, res) =>{
  let errors = [];
  const { name, email, password, confirm_password } = req.body;
  if (name.length <= 1) {
    errors.push({ text: 'Please insert your name'});
  }
  if (email.length <= 1) {
    errors.push({ text: 'Please insert your email'});
  }
  if (password != confirm_password) {
    errors.push ({ text: 'Password do not match' });
  }
  if (password.length < 4) {
    errors.push({ text: 'Password must be at least 4 charachters' });
  }
  if (errors.length > 0){
    res.render('users/signup', {errors, name, email, password, confirm_password});
  }else{
    // Look for email coincidence
    const emailUser = await User.findOne({email: email});
    if (emailUser){
      req.flash('error_msg', 'The email is already in use');
      res.redirect('/users/signup');
    }else{
      // Saving a new user
      const newUser = new User({name, email, password});
      newUser.password = await newUser.encryptPassword(password);
      await newUser.save();
      req.flash('success_msg', 'You are registered');
      res.redirect('/users/signin');
    }
  }
});

//Signin
router.get('/users/signin', (req, res) => {
  res.render('users/signin');
});

//User authentication user
router.post('/users/signin', passport.authenticate('local', {
  successRedirect: '/notes',
  failureRedirect: '/users/signin',
  failureFlash: true
}));

//Logout
router.get('/users/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out now.');
  res.redirect('/users/signin');
});

module.exports = router;
