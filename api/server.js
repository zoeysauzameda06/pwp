import 'dotenv/config'
import express from 'express'
import morgan from 'morgan'
import formData from 'form-data'
import Mailgun from 'mailgun.js'
import { z } from 'zod'

const app = express()
app.use(express.json())
app.use(morgan('dev'))

const mailgun = new Mailgun(formData)
const mg = mailgun.client({
    username: 'api',
    key: process.env.MAILGUN_API_KEY,
    // if your Mailgun domain is in the EU region, uncomment:
    // url: 'https://api.eu.mailgun.net',
})

// What a valid form submission looks like
const contactSchema = z.object({
    name: z.string().trim().min(1, 'Name is required').max(100),
    email: z.string().trim().email('Invalid email'),
    message: z.string().trim().min(1, 'Message is required').max(5000),
})

app.post('/apis/contact', async (req, res) => {
    const result = contactSchema.safeParse(req.body)
    if (!result.success) {
        return res.status(400).json({ status: 400, message: result.error.issues[0].message })
    }

    const { name, email, message } = result.data

    try {
        await mg.messages.create(process.env.MAILGUN_DOMAIN, {
            from: `Find Paw BestFriend <postmaster@${process.env.MAILGUN_DOMAIN}>`,
            to: [process.env.MAILGUN_RECIPIENT],
            'h:Reply-To': email,
            subject: `New contact message from ${name}`,
            text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
        })
        res.json({ status: 200, message: 'Message sent! We will get back to you soon.' })
    } catch (error) {
        console.error(error)
        res.status(500).json({ status: 500, message: 'Something went wrong. Please try again later.' })
    }
})

app.listen(4200, () => console.log('API running on http://localhost:4200'))
