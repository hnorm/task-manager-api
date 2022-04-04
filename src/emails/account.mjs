import sgMail from "@sendgrid/mail"

const sendgridAPIKey = process.env.SENDGRID_API_KEY
sgMail.setApiKey(sendgridAPIKey)

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'norman.hu@servian.com',
        subject: 'Welcome to the Task Manager App',
        text: `Welcome to the Task Manager App, ${name}. Let me know what you think about this app!`
    })
}

const sendCancellationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'norman.hu@servian.com',
        subject: 'Goodbye from the Task Manager App',
        text: `Goodbye ${name}, we hope to see you again!`
    })
}

export default { sendWelcomeEmail, sendCancellationEmail }