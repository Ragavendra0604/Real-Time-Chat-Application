import express from "express";

const router = express.Router();

router.get("/signup", (req, res) => {
    res.send("SignUp Endpoint");
});

router.get("/login", (req, res) => {
    res.send("Login Endpoint");
});

router.get("/logout", (req, res) => {
    res.send("Logout Endpoint");
});

router.get("/update", (req, res) => {
    res.send("Update Endpoint");
});

export default router;