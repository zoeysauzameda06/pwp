import { z } from 'zod'

export function contactForm () {
    // Step 1.1: validation schema (backend re-validates and sanitizes)
    const schema = z.object({
        name: z.string({ required_error: 'name is a required field' })
            .min(1, { message: 'name must consist of at least one character' })
            .max(64, { message: 'name cannot be greater than 64 characters' }),
        email: z.string({ required_error: 'email is a required field' })
            .email({ message: 'invalid email address' })
            .max(128, { message: 'email must be less than 128 characters' }),
        subject: z.string()
            .max(64, { message: 'subject must be less than 64 characters' })
            .optional(),
        message: z.string({ required_error: 'message is a required field' })
            .min(1, { message: 'message must be at least 1 character' })
            .max(500, { message: 'message cannot be greater than 500 characters' })
    })

    // Step 1.2: DOM references
    const form = document.getElementById('contact-form')
    if (!form) return

    const nameInput = document.getElementById('name')
    const emailInput = document.getElementById('email')
    const messageInput = document.getElementById('message')
    const subjectInput = document.getElementById('subject')

    const nameError = document.getElementById('nameError')
    const emailError = document.getElementById('emailError')
    const messageError = document.getElementById('messageError')
    const subjectError = document.getElementById('subjectError')

    const statusOutput = document.getElementById('status')

    const successClasses = ['text-green-800', 'bg-green-50']
    const errorClasses = ['text-red-800', 'bg-red-50']

    const showStatus = (message, isSuccess) => {
        statusOutput.textContent = message
        statusOutput.classList.remove(...successClasses, ...errorClasses)
        statusOutput.classList.add(...(isSuccess ? successClasses : errorClasses))
        statusOutput.classList.remove('hidden')
    }

    // Step 1.3: submit listener, reset previous errors
    form.addEventListener('submit', event => {
        event.preventDefault()

        const formData = new FormData(form)

        const errorArray = [nameError, emailError, messageError, subjectError]
        errorArray.forEach(element => element.classList.add('hidden'))

        const inputArray = [nameInput, emailInput, messageInput, subjectInput]
        inputArray.forEach(input => input.classList.remove('border-red-500'))

        statusOutput.classList.add('hidden')

        // Step 1.4: honeypot check - fake success for bots
        if (formData.get('website') !== '') {
            form.reset()
            showStatus('message sent successfully', true)
            return
        }

        // Step 1.5: convert FormData and validate
        const values = Object.fromEntries(formData.entries())
        values.subject = values.subject === '' ? undefined : values.subject

        const result = schema.safeParse(values)

        // Step 1.6: per-field errors
        if (result.success === false) {
            const errorsMap = {
                name: { inputError: nameInput, errorElement: nameError },
                email: { inputError: emailInput, errorElement: emailError },
                message: { inputError: messageInput, errorElement: messageError },
                subject: { inputError: subjectInput, errorElement: subjectError }
            }

            result.error.issues.forEach(error => {
                const field = errorsMap[error.path[0]]
                if (!field) return
                field.errorElement.textContent = error.message
                field.errorElement.classList.remove('hidden')
                field.inputError.classList.add('border-red-500')
            })
            return
        }

        // Step 1.7: POST to backend (Vite proxies /apis to localhost:4200)
        fetch('/apis/contact', {
            method: 'post',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(values)
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === 200) {
                    showStatus(data.message, true)
                    form.reset()
                } else {
                    showStatus(data.message, false)
                }
            })
            .catch(() => {
                showStatus('could not reach the server, please try again later', false)
            })
    })
}
