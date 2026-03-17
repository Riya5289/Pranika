require('dotenv').config();
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Error connecting to email server:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});


// Function to send email
const sendEmail = async (to, subject, text, html, attachments = []) => {
  try {
    const mailOptions = {
      from: `"Pranika Healthcare" <${process.env.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    };

    if (attachments.length > 0) {
      mailOptions.attachments = attachments.map(attachment => ({
        filename: attachment.filename,
        path: attachment.path,
        contentType: attachment.mimetype
      }));
    }

    const info = await transporter.sendMail(mailOptions);

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

async function sendRegistrationEmail(userEmail,name){
  const subject="Welcome To Pranika Healthcare"
  const text =`Hello ${name},\n\nThank you for registering at Pranika Healthcare. We are excited to have you on board!\n\nBest regards,\nThe Pranika Team`
  const html=`<p>Hello ${name},</p><p>Thank you for registering at Pranika Healthcare. We are excited to have you on board!</p><p>Best regards,<br>The Pranika Team</p>`

  await sendEmail(userEmail,subject,text,html);
}

async function sendTransferRequestEmail(toEmail, transferData, attachments) {
  const subject = `Patient Transfer Request - ${transferData.patientInfo.name}`;
  const text = `
Patient Transfer Request Details:

Patient Name: ${transferData.patientInfo.name}
Age: ${transferData.patientInfo.age}
Condition: ${transferData.patientInfo.condition}
Medical History: ${transferData.patientInfo.medicalHistory || 'N/A'}

From Hospital: ${transferData.fromHospitalName}
To Hospital: ${transferData.toHospitalName}

Medical Notes: ${transferData.medicalNotes || 'N/A'}

Please review the attached documents and respond accordingly.

Best regards,
Pranika Healthcare System
  `;

  const html = `
    <h2>Patient Transfer Request</h2>
    <h3>Patient Information:</h3>
    <ul>
      <li><strong>Name:</strong> ${transferData.patientInfo.name}</li>
      <li><strong>Age:</strong> ${transferData.patientInfo.age}</li>
      <li><strong>Condition:</strong> ${transferData.patientInfo.condition}</li>
      <li><strong>Medical History:</strong> ${transferData.patientInfo.medicalHistory || 'N/A'}</li>
    </ul>
    <h3>Hospital Details:</h3>
    <ul>
      <li><strong>From:</strong> ${transferData.fromHospitalName}</li>
      <li><strong>To:</strong> ${transferData.toHospitalName}</li>
    </ul>
    <h3>Medical Notes:</h3>
    <p>${transferData.medicalNotes || 'N/A'}</p>
    <p>Please review the attached documents and respond accordingly.</p>
    <p>Best regards,<br>Pranika Healthcare System</p>
  `;

  await sendEmail(toEmail, subject, text, html, attachments);
}

module.exports ={
  sendRegistrationEmail,
  sendTransferRequestEmail
}