const express = require('express');
const authRoutes = require('../modules/auth/auth.routes');
const usersRoutes = require('../modules/users/users.routes');
const skillsRoutes = require('../modules/skills/skills.routes');
const matchmakingRoutes = require('../modules/matchmaking/matchmaking.routes');
const mentoriasRoutes = require('../modules/mentorias/mentorias.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/skills', skillsRoutes);
router.use('/matchmaking', matchmakingRoutes);
router.use('/mentorias', mentoriasRoutes);

module.exports = router;