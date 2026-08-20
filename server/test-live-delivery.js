import nodemailer from 'nodemailer';

async function testDelivery() {
  console.log('Testing 2Factor.in SMS...');
  try {
    const smsRes = await fetch('https://2factor.in/API/V1/6b1b0753-9ca1-11f1-9cb1-0200cd936042/SMS/9014567531/123456');
    const smsData = await smsRes.json();
    console.log('📱 2Factor.in SMS Result:', smsData);
  } catch (err) {
    console.error('📱 SMS Error:', err.message);
  }

  console.log('\nTesting Gmail SMTP...');
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'jdeep8823@gmail.com',
        pass: 'ehzm xbjz dmly spct'
      }
    });

    const info = await transporter.sendMail({
      from: '"Stitch and Hook" <jdeep8823@gmail.com>',
      to: 'jdeep8823@gmail.com',
      subject: 'Stitch & Hook Real-Time OTP Test',
      html: '<h1>123456</h1>'
    });
    console.log('✉️ Gmail SMTP Success! Message ID:', info.messageId);
  } catch (err) {
    console.error('✉️ Gmail SMTP Error:', err.message);
  }
}

testDelivery();
