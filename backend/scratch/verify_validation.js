const Joi = require('joi');

const schema = Joi.object({
  email: Joi.string()
    .email()
    .pattern(new RegExp('@gmail\\.com$'))
    .required(),
  password: Joi.string()
    .min(8)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])'))
    .required()
});

const testCases = [
  { 
    data: { email: 'user@acsd.com', password: 'Valid123!' }, 
    expected: false, 
    label: 'Invalid email domain (acsd.com)' 
  },
  { 
    data: { email: 'user@gmail.com', password: 'Valid123!' }, 
    expected: true, 
    label: 'Valid email and password' 
  },
  { 
    data: { email: 'invalid-email', password: 'Valid123!' }, 
    expected: false, 
    label: 'Malformed email' 
  },
  { 
    data: { email: 'test@acsd.com', password: 'short' }, 
    expected: false, 
    label: 'Valid email but weak password' 
  }
];

testCases.forEach(({ data, expected, label }) => {
  const { error } = schema.validate(data);
  const isValid = !error;
  console.log(`${label}: Email:[${data.email}] Pwd:[${data.password}] - Expected: ${expected}, Actual: ${isValid} - ${isValid === expected ? 'PASS' : 'FAIL'}`);
  if (error) {
    console.log(`  Error: ${error.details[0].message}`);
  }
});
