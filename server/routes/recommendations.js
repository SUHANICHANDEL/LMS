const express = require("express");
const { PythonShell } = require("python-shell");
const router = express.Router();

router.get("/:userId", (req, res) => {
    let options = {
        args: [req.params.userId]
    };

    PythonShell.run("server/recommender/recommend_wrapper.py", options, function (err, result) {
        if (err) return res.status(500).send(err);
        res.json(JSON.parse(result[0]));
    });
});

module.exports = router;
