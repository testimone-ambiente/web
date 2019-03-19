const express = require(`express`);
const router = express.Router();

router.get('/', (req, res) => {

  res.json({

    success: true,
    message: "api",
    version: "1.0.0"

  })

})

router.use('/auth', require("./auth"))
router.use('/data', require("./data"))

module.exports = router;
