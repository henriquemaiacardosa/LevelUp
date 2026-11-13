const express = require('express');
const authRoutes = require('../modules/auth/auth.routes');
const usersRoutes = require('../modules/users/users.routes');
const skillsRoutes = require('../modules/skills/skills.routes');
const matchmakingRoutes = require('../modules/matchmaking/matchmaking.routes');
const mentoriasRoutes = require('../modules/mentorias/mentorias.routes');
const leaderboardRoutes = require('../modules/leaderboard/leaderboard.routes');
const disciplinasRoutes = require('../modules/disciplinas/disciplinas.routes');
const disponibilidadeRoutes = require('../modules/disponibilidade/disponibilidade.routes');
const tutoresRoutes = require('../modules/tutores/tutores.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/skills', skillsRoutes);
router.use('/matchmaking', matchmakingRoutes);
router.use('/mentorias', mentoriasRoutes);
router.use('/leaderboard', leaderboardRoutes);
router.use('/disciplinas', disciplinasRoutes);
router.use('/disponibilidade', disponibilidadeRoutes);
router.use('/tutores', tutoresRoutes);

module.exports = router;