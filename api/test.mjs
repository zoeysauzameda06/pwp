// Smoke test: start the server first (node server.js), then run node test.mjs
// website is '' to simulate a real human (honeypot untouched)
fetch('http://localhost:4200/apis/contact', {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        name: 'Marty',
        email: 'marty@skiingisbetter.snow',
        message: 'I secretly like skiing',
        subject: 'did it work',
        website: ''
    })
})
    .then(response => response.json())
    .then(data => { console.log(data) })
