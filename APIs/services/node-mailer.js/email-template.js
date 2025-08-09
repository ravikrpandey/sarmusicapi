module.exports = {
  otpTemplate: (otp) => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SAR Music - OTP Verification</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      color: #444;
      background-color: #f3f4f6;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      padding: 20px;
      border-radius: 10px;
      background-color: #ffffff;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      padding: 20px 0;
      border-bottom: 1px solid #ddd;
    }
    .header h1 {
      color: #ff6f61;
      font-size: 24px;
      font-weight: bold;
      margin: 0;
    }
    .message {
      padding: 20px 0;
      text-align: center;
      color: #333;
    }
    .otp-code {
      font-size: 32px;
      font-weight: bold;
      color: #ff6f61;
      margin: 10px 0;
    }
    .button {
      display: inline-block;
      padding: 10px 20px;
      margin: 20px 0;
      background-color: #ff6f61;
      color: #ffffff;
      font-weight: bold;
      border-radius: 5px;
      text-decoration: none;
    }
    .footer {
      text-align: center;
      padding: 20px;
      font-size: 12px;
      color: #aaa;
      border-top: 1px solid #ddd;
    }
    .footer a {
      color: #ff6f61;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>SAR Music</h1>
    </div>
    <div class="message">
      <h2>Welcome to SAR Music!</h2>
      <p>Hi there,</p>
      <p>To complete your registration on SAR Music, please enter the OTP code below:</p>
      <div class="otp-code">${otp}</div>
      <p>We’re thrilled to have you on board! With SAR Music, you’ll have access to a world of your favorite songs, playlists, and more.</p>
      <p>If you didn’t request this, please ignore this email.</p>
    </div>
    <div class="footer">
      <p>Need help? <a href="mailto:support@sarmusic.com">Contact our support team</a></p>
      <p>&copy; ${new Date().getFullYear()} SAR Music. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
  }
};
