const User = require('../models/User');

// Register/Create user with optional PIN
exports.register = async (req, res) => {
  try {
    const { pin } = req.body;

    // Validate PIN format (4 digits) if provided
    if (pin !== undefined && pin !== null && pin !== '') {
      if (!/^\d{4}$/.test(pin)) {
        return res.status(400).json({ error: 'PIN must be exactly 4 digits' });
      }
    }

    const userId = await User.create(pin || null);
    
    if (!userId) {
      return res.status(500).json({ error: 'Failed to create user' });
    }
    
    res.status(201).json({
      userId: userId,
      message: 'User created successfully',
      hasPin: !!pin
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Failed to register user', details: error.message });
  }
};

// Login/Verify PIN
exports.login = async (req, res) => {
  try {
    const { pin } = req.body;

    if (!pin || !/^\d{4}$/.test(pin)) {
      return res.status(400).json({ error: 'Valid 4-digit PIN is required' });
    }

    const user = await User.findByPin(pin);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid PIN' });
    }

    res.json({
      userId: user.id,
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Failed to login', details: error.message });
  }
};