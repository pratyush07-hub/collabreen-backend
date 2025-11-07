require('dotenv').config();
const USER = require("../models/user");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sendOTP, sendEmailToUser } = require("../utils/email");

//SIGNUP
async function handleUserSignup(req, res) {
  const { name, instaHandle, email, phoneNumber, password, why } = req.body;
  console.log("data", req.body)

  if (!phoneNumber || !name || !email || !instaHandle || !password || !why) {
    return res.status(400).json({ msg: "All fields are required" });
  }

  try {
    const user = await USER.findOne({
      $or: [
        { email: email },
        { phoneNumber: phoneNumber },
        { instaHandle: instaHandle },
      ],
    });
    console.log("user: ", user)

    if (user) {
      if (user.email === email) {
        return res.status(400).json({ msg: "Email is already registered" });
      }
      if (user.phoneNumber === phoneNumber) {
        return res
          .status(400)
          .json({ msg: "Phone number is already registered" });
      }
      if (user.instaHandle === instaHandle) {
        return res
          .status(400)
          .json({ msg: "Instagram handle is already registered" });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await USER.create({
      name: name,
      instaHandle: instaHandle,
      email: email,
      phoneNumber: phoneNumber,
      password: hashedPassword,
      why: why,
      profilePic: `https://ui-avatars.com/api/?name=${name}&background=random`,
    });
    console.log("new user: ", newUser)

    if (!newUser) {
      return res.status(500).json({ msg: "Error signing up" });
    }
    const code = crypto.randomInt(100000, 999999); // Generate OTP
    const codeString = code.toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    newUser.otp = codeString;
    newUser.otpExpiry = otpExpiry;
    await newUser.save();

    // Styled email content
    const emailContent = `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9; border-radius: 8px; width: 400px; margin: auto;">
            <h2 style="color: #333;">Your OTP Code</h2>
            <p style="font-size: 18px;">Use the following code to complete your signup:</p>
            <div style="font-size: 24px; font-weight: bold; color: #4CAF50;">${codeString}</div>
            <p style="font-size: 14px; color: #666;">This code will expire in 10 minutes. If you did not request this code, please ignore this email.</p>
        </div>
        `;

    await sendOTP("Your OTP Code", email, emailContent);
    const userDetails = {
      id: newUser._id,
      name: name,
      instaHandle: instaHandle,
      email: email,
      phoneNumber: phoneNumber,

    };
    const token = jwt.sign({ userDetails }, process.env.JWT_SECRET, {
      expiresIn: "12h",
    });
    return res.json({ msg: "OTP sent to email", token, userDetails });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Error signing up" });
  }
}

//VERIFICATION
async function handleUserEmailVerification(req, res) {
  const otp = req.body.otpCode;

  if (!otp) {
    return res.status(400).json({ msg: "OTP is required" });
  }

  try {
    const userEmail = req.user.email;

    const user = await USER.findOne({ email: userEmail });

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    console.log(otp);
    const isValidOTP = user.otp === otp;
    const isExpired = user.otpExpiry < new Date();

    if (!isValidOTP) {
      return res.status(400).json({ msg: "Invalid OTP" });
    }
    if (isExpired) {
      return res.status(400).json({ msg: "OTP has expired" });
    }

    user.emailVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    const emailContent = `
            <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
                <h2 style="color: #333;">Email Verified Successfully!</h2>
                <p style="font-size: 16px;">Thank you for verifying your email address. You can now log in to your account.</p>
            </div>
        `;
    await sendOTP("Email Verification Successful", userEmail, emailContent); // Send success email

    return res.json({ msg: "Email verified successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Error verifying email" });
  }
}

//SIGNIN
async function handleUserSignin(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ msg: "All fields are required" });
  }

  try {
    const user = await USER.findOne({ email: email });
    if (!user) {
      return res.status(404).json({ msg: "User Not Found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      const userDetails = {
        id: user._id,
        name: user.name,
        instaHandle: user.instaHandle,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        roleId: user.roleId
      };
      const token = jwt.sign({ userDetails }, process.env.JWT_SECRET, {
        expiresIn: "12h",
      });
      return res.json({ userDetails , token });
    } else {
      return res.status(400).json({ msg: "Invalid Password" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Error signing in" });
  }
}

//GET PROFILE
async function handleUserProfile(req, res) {
  console.log(req.user);
  try {
    const user = await USER.findOne({ _id: req.user.id });
    const { password: _, ...userWithoutPassword } = user.toObject();
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    return res.status(200).json({ userWithoutPassword });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Server Error" });
  }
}

async function handleUserProfileEdit(req, res) {
  try {
    const user = await USER.findByIdAndUpdate(
      req.user.id,
      { ...req.body },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ msg: "User Does Not Exist" });
    }
    const { password, ...userWithoutPassword } = user.toObject();
    const token = await jwt.sign(userWithoutPassword, process.env.JWT_SECRET, {
      expiresIn: "12h",
    });
    return res.json({ msg: "Profile Edited Successfully", token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Server Error" });
  }
}

//CHANGE PASSWORD
async function handleUserPasswordChange(req, res) {
  try {
    const newPassword = req.body.password;
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const user = await USER.findByIdAndUpdate(
      req.user.id,
      { password: hashedPassword },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ msg: "User Not Found" });
    }
    return res.json({ msg: "Password updated successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Server Error" });
  }
}
//DELETE
async function handleUserDelete(req, res) {
  try {
    const user = await USER.findByIdAndDelete(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    return res.status(200).json({ msg: "Account deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Server Error" });
  }
}

//FORGOT PASSWORD
async function handleUserForgotPassword(req, res) {
  const { email } = req.body;
  const FRONTEND_URL = process.env.FRONTEND_URL;
  try {
    const user = await USER.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpire = Date.now() + 3600000;

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = resetTokenExpire;
    await user.save();

    const resetUrl = `${FRONTEND_URL}/reset-password/${resetToken}`;

    const emailContent = `
  <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4; border-radius: 8px; max-width: 600px; margin: auto;">
    <h1 style="color: #333;">Password Reset Link</h1>
    <p style="font-size: 16px; color: #555;">
      To reset your password, please click the link below:
    </p>
    <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; margin-top: 10px; font-size: 16px; color: #fff; background-color: #007BFF; border-radius: 5px; text-decoration: none;">Reset Password</a>
    <p style="font-size: 14px; color: #777; margin-top: 20px;">
      If you did not request this password reset, please ignore this email.
    </p>
  </div>
`;

    sendEmailToUser(email, "Password Reset Link", emailContent);


    res.status(200).json({ message: "Password reset email sent" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}

//RESET THE PASSWORD
async function handleUserResetPassword(req, res) {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const user = await USER.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() }, // Token must not be expired
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    user.password = await bcrypt.hash(newPassword, 10);

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}

async function handleValidateResetToken(req, res) {
  const { token } = req.params;

  try {
    const user = await USER.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() }, // Token must not be expired
    });

    if (!user) {
      return res.status(400).json({ valid: false, message: 'Invalid or expired token' });
    }

    return res.status(200).json({ valid: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ valid: false, message: 'Server error' });
  }
}

// USER LOGOUT
async function handleUserLogout(req, res) {
  try {
    // If you're storing JWT in cookies, clear the cookie
    res.clearCookie('jwt', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
    });

    // Optional: if you maintain token blacklist, add token to blacklist here

    return res.status(200).json({ msg: 'User logged out successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: 'Server error while logging out' });
  }
}

// GET CURRENT USER
async function handleGetCurrentUser(req, res) {
  try {
    const userId = req.user?.id; // Extracted from JWT by auth middleware
    if (!userId) {
      return res.status(401).json({ msg: "Unauthorized - No user found in request" });
    }

    const user = await USER.findById(userId).select("-password -otp -otpExpiry -resetPasswordToken -resetPasswordExpire");
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error("Error fetching current user:", error);
    return res.status(500).json({ msg: "Server error while fetching current user" });
  }
}


module.exports = {
  handleUserSignup,
  handleUserEmailVerification,
  handleUserSignin,
  handleUserProfile,
  handleUserProfileEdit,
  handleUserPasswordChange,
  handleUserDelete,
  handleUserForgotPassword,
  handleUserResetPassword,
  handleValidateResetToken,
  handleUserLogout,
  handleGetCurrentUser
};
