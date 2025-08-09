const db = require("../../IndexFiles/modelsIndex");
const tbl_loginUser = db.user;
const SECRET_KEY = process.env.SECRET_KEY || "";
const TOKEN_EXPIRES_TIME = parseInt(process.env.TOKEN_EXPIRES_TIME, 10) || 600;
const jwt = require('jsonwebtoken');
const { sendOTPEmail, generateOTP } = require('../services/node-mailer.js/index');


exports.loginOrRegisterUser = async (req, res) => {
    try {
        const { email, mobileNumber, otp, fullName } = req.body;
        const masterOtp = "9955"; // Master OTP for testing
        const generatedOtp = await generateOTP(); // Assume generateOTP() function exists

        // Check or create user in a single database call
        let [userData, created] = await tbl_loginUser.findOrCreate({
            where: { mobileNumber },
            defaults: {
                userName: fullName,
                email,
                type: 'user',
                otp: generatedOtp
            }
        });

        if (!created && !otp) {
            // Update OTP for existing user
            await userData.update({ otp: generatedOtp });
        }

        if (!otp) {
            // If OTP is not provided, generate and send it
            const token = jwt.sign(
                { email: userData.email, userName: userData.userName, mobileNumber },
                SECRET_KEY,
                { expiresIn: TOKEN_EXPIRES_TIME }
            );

            // Send OTP via email (assume sendOTPEmail is defined)
           await sendOTPEmail(email, generatedOtp); // Make this async for performance
            return res.status(200).send({
                code: 200,
                message: "User created successfully",
                data: userData.type,
                token
            });
        } else if (otp === userData.otp || otp === masterOtp) {
            // Verify OTP or Master OTP
            const token = jwt.sign(
                { email: userData.email, userName: userData.userName, mobileNumber },
                SECRET_KEY,
                { expiresIn: TOKEN_EXPIRES_TIME }
            );

            return res.status(200).send({
                code: 200,
                message: "User login successfull",
                data: userData,
                token
            });
        } else {
            return res.status(200).send({ success: false, message: "Invalid OTP" });
        }
    } catch (error) {
        return res.status(500).send({ success: false, message: error.message || "Something went wrong!" });
    }
};





//========================= 

exports.getLoginUser = async (req, res) => {
    try {
        const userData = await tbl_loginUser.findAll({});
        return res
            .status(200)
            .send({
                code: 200,
                message: "Data fetched successfully",
                data: userData,
            });
    } catch (error) {
        return res
            .status(500)
            .send({ code: 500, message: error.message || "Server Error !" });
    }
};
