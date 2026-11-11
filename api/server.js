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

// strips HTML tags as a basic XSS guard
const stripTags = val => val.replace(/<[^>]*>/g, '')

// What a valid form submission looks like (trimmed + sanitized)
const contactSchema = z.object({
    name: z.string({ required_error: 'name is a required field' })
        .transform(stripTags)
        .pipe(z.string().trim()
            .min(1, { message: 'name must consist of at least one character' })
            .max(64, { message: 'name cannot be greater than 64 characters' })),
    email: z.string({ required_error: 'email is a required field' })
        .trim()
        .email({ message: 'invalid email address' })
        .max(128, { message: 'email must be less than 128 characters' })
        .transform(stripTags),
    subject: z.string()
        .trim()
        .max(64, { message: 'subject must be less than 64 characters' })
        .transform(stripTags)
        .optional(),
    message: z.string({ required_error: 'message is a required field' })
        .transform(stripTags)
        .pipe(z.string().trim()
            .min(1, { message: 'message must be at least 1 character' })
            .max(500, { message: 'message cannot be greater than 500 characters' })),
})

// health check
app.get('/apis/contact', (req, res) => {
    res.json('this thing is on')
})

app.post('/apis/contact', async (req, res) => {
    const result = contactSchema.safeParse(req.body)
    if (!result.success) {
        return res.status(400).json({ status: 400, message: result.error.issues[0].message })
    }

    // honeypot touched -> pretend it worked, but don't send anything
    if (req.body.website) {
        return res.json({ status: 200, message: 'Message sent! We will get back to you soon.' })
    }

    const { name, email, subject, message } = result.data

    try {
        await mg.messages.create(process.env.MAILGUN_DOMAIN, {
            from: `${name} <postmaster@${process.env.MAILGUN_DOMAIN}>`,
            to: [process.env.MAILGUN_RECIPIENT],
            'h:Reply-To': email,
            subject: subject || `New contact message from ${name}`,
            text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
        })
        res.json({ status: 200, message: 'Message sent! We will get back to you soon.' })
    } catch (error) {
        console.error(error)
        res.status(500).json({ status: 500, message: 'Something went wrong. Please try again later.' })
    }
})

app.listen(4200, () => console.log('API running on http://localhost:4200'))
