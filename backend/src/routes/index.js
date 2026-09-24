const express = require('express');
const authRoutes = require('../modules/auth/auth.routes');
const usersRoutes = require('../modules/users/users.routes');
const skillsRoutes = require('../modules/skills/skills.routes');


const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/skills', skillsRoutes);

module.exports = router;