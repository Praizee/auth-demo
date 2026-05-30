const { Router } = require('express');
const { signup, login, updateAccount } = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');
const {
  signupValidators,
  loginValidators,
  updateAccountValidators,
} = require('../validators/auth.validators');

const router = Router();

router.post('/signup', signupValidators, signup);
router.post('/login', loginValidators, login);
router.put('/account', authenticate, updateAccountValidators, updateAccount);

module.exports = router;
