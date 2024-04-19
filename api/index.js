const router = require('express').Router();

/*----------------------------------------------------------------------------*/

// Put your extra files here.

router.use(require('./session'));
router.use(require('./user'));
router.use(require('./quiz'));
router.use(require('./play'));
router.use(require('./report'));
router.use(require('./comment'));

/*----------------------------------------------------------------------------*/

module.exports = router;
