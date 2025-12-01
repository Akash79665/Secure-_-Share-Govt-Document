const nodemailer = require('nodemailer');
const logger = require('../config/logger');

// Create transporter
const createTransporter = () => {
  // Validate email configuration
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('Email configuration missing. Please set EMAIL_USER and EMAIL_PASS in .env file');
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS // Gmail App Password
    }
  });
};

// Send OTP email
exports.sendOTPEmail = async (email, otp, name) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"Digital Locker" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify Your Account - OTP',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              line-height: 1.6; 
              color: #333;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
            }
            .container { 
              max-width: 600px; 
              margin: 20px auto;
              background-color: #ffffff;
              border-radius: 10px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            .header { 
              background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
              color: white; 
              padding: 30px 20px; 
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
            }
            .content { 
              padding: 40px 30px;
            }
            .content h2 {
              color: #4f46e5;
              margin-top: 0;
            }
            .otp-box { 
              background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
              border: 3px dashed #4f46e5; 
              padding: 25px; 
              text-align: center; 
              font-size: 36px; 
              font-weight: bold; 
              letter-spacing: 8px; 
              margin: 25px 0;
              border-radius: 10px;
              color: #4f46e5;
            }
            .warning {
              background-color: #fef3c7;
              border-left: 4px solid #f59e0b;
              padding: 15px;
              margin: 20px 0;
              border-radius: 5px;
            }
            .footer { 
              text-align: center; 
              margin-top: 30px; 
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              color: #6b7280; 
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Digital Document Locker</h1>
            </div>
            <div class="content">
              <h2>Hello ${name}! 👋</h2>
              <p>Thank you for registering with Digital Document Locker. To complete your registration and secure your account, please verify your email address.</p>
              
              <p style="font-size: 16px; margin-top: 20px;">Your One-Time Password (OTP) is:</p>
              <div class="otp-box">${otp}</div>
              
              <div class="warning">
                <strong>⏰ Important:</strong> This OTP will expire in <strong>5 minutes</strong>. Please verify your account promptly.
              </div>
              
              <p style="color: #6b7280; font-size: 14px;">If you didn't request this registration, please ignore this email. Your account will not be created without verification.</p>
              
              <p style="margin-top: 30px;">Best regards,<br><strong>Digital Locker Team</strong></p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply.</p>
              <p>© ${new Date().getFullYear()} Digital Document Locker. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`OTP email sent successfully to ${email}: ${info.messageId}`);
    console.log(`✅ OTP email sent to: ${email}`);
    return { success: true, messageId: info.messageId };
    
  } catch (error) {
    logger.error(`Failed to send OTP email to ${email}: ${error.message}`);
    console.error(`❌ Email sending failed: ${error.message}`);
    
    // Provide helpful error messages
    if (error.code === 'EAUTH') {
      console.error('\n💡 Email Authentication Failed!');
      console.error('   - Make sure you are using Gmail App Password (NOT your regular password)');
      console.error('   - Go to: https://myaccount.google.com/apppasswords');
      console.error('   - Create a new App Password and update EMAIL_PASS in .env\n');
    }
    
    throw new Error('Failed to send verification email. Please check email configuration.');
  }
};

// Send document share notification
exports.sendShareNotification = async (recipientEmail, senderName, documentTitle, shareLink) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"Digital Locker" <${process.env.EMAIL_USER}>`,
      to: recipientEmail,
      subject: `${senderName} shared a document with you`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              line-height: 1.6; 
              color: #333;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
            }
            .container { 
              max-width: 600px; 
              margin: 20px auto;
              background-color: #ffffff;
              border-radius: 10px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            .header { 
              background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
              color: white; 
              padding: 30px 20px; 
              text-align: center;
            }
            .content { 
              padding: 40px 30px;
            }
            .document-info {
              background-color: #f9fafb;
              border-left: 4px solid #4f46e5;
              padding: 20px;
              margin: 20px 0;
              border-radius: 5px;
            }
            .button { 
              display: inline-block;
              background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
              color: white !important; 
              padding: 14px 35px; 
              text-decoration: none; 
              border-radius: 8px;
              font-weight: bold;
              margin: 20px 0;
              box-shadow: 0 4px 6px rgba(79, 70, 229, 0.3);
            }
            .link-box {
              background-color: #f3f4f6;
              padding: 15px;
              border-radius: 5px;
              word-break: break-all;
              font-size: 14px;
              color: #4b5563;
              margin: 15px 0;
            }
            .footer { 
              text-align: center; 
              margin-top: 30px; 
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              color: #6b7280; 
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📄 Document Shared</h1>
            </div>
            <div class="content">
              <p><strong>${senderName}</strong> has shared a document with you through Digital Document Locker.</p>
              
              <div class="document-info">
                <strong>📋 Document Title:</strong><br>
                <span style="font-size: 18px; color: #4f46e5;">${documentTitle}</span>
              </div>
              
              <p style="margin-top: 25px;">Click the button below to securely view the document:</p>
              
              <div style="text-align: center;">
                <a href="${shareLink}" class="button">🔓 View Document</a>
              </div>
              
              <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">Or copy and paste this link in your browser:</p>
              <div class="link-box">${shareLink}</div>
              
              <p style="margin-top: 30px;">Best regards,<br><strong>Digital Locker Team</strong></p>
            </div>
            <div class="footer">
              <p>This is an automated notification from Digital Document Locker</p>
              <p>© ${new Date().getFullYear()} Digital Document Locker. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Share notification sent to ${recipientEmail}: ${info.messageId}`);
    console.log(`✅ Share notification sent to: ${recipientEmail}`);
    return { success: true, messageId: info.messageId };
    
  } catch (error) {
    logger.error(`Failed to send share notification to ${recipientEmail}: ${error.message}`);
    console.error(`❌ Failed to send share notification: ${error.message}`);
    throw new Error('Failed to send notification email');
  }
};