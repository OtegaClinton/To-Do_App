const forgotPasswordhtml = (fullName, verificationLink) =>{
    return `
    <html>
    <body>
        <h1>Hello ${fullName},</h1>
        <p>We received a request to reset your password.</p>
        <p>Please click the link below to reset your password:</p>
        <a href="${verificationLink}">Reset Password</a>
        <p>If you didn't request this, please ignore this email.</p>
        <p>Best regards,</p>
        <p>To-Do App</p>
    </body>
    </html>
`
};

module.exports=forgotPasswordhtml;
   
