// Node Mailer
require('dotenv').config()
const nodemailer = require('nodemailer');
const sgTransport = require('nodemailer-sendgrid-transport');
const options = {
    auth: {
        api_key: process.env.SEND_GRID_API
    }
}
const sendGridClient = nodemailer.createTransport(sgTransport(options));
const sendEmail = (order) => {
    const { name, email, quantity, price, totalPrice } = order;
    const sentEmailThis = {
        from: process.env.SENDER_EMAIL,
        to: email,
        subject: `${name} Order Placed Successful`,
        text: `${name} Order Placed Successful`,
        html: `
        <div>
        <h3>Thanks for your Order</h3>
        <p>Product Name: ${name}</p> <br>
        <p>Quantity: ${quantity}</p> <br>
        <p>Product Name: ${price}</p> <br>
        <p>Total Price: ${totalPrice.toString()}</p>        
        </div>
        `
    };
    sendGridClient.sendMail(sentEmailThis, function (err, info) {
        if (err) {
            console.log(err);
        }
        else {
            // console.log('Message Sent: ' + info);
        }
    });
}

module.exports = sendEmail;

