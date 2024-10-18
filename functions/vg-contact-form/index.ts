import {SESClient, SendEmailCommand} from "@aws-sdk/client-ses";

const {
    SYSTEM_EMAIL,
    SECONDARY_EMAIL,
    AWS_REGION,
    CF_CAPTCHA_SECRET,
} = process.env;

const sesClient = new SESClient({region: AWS_REGION});
export const handler = async (event) => {
    try {
        const {name, email, content, captchaToken} = JSON.parse(event.body);
        if (!name || !email || !content || !captchaToken) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    error: 'Bad Request',
                    message: 'Please provide all required fields',
                    date: new Date().toISOString(),
                }),
            };
        }

        const cfResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                secret: CF_CAPTCHA_SECRET,
                response: captchaToken,
            }),
        });

        const cfResponseData = await cfResponse.json();

        if (!cfResponseData.success) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    error: 'Bad Request',
                    message: 'Captcha verification failed',
                    date: new Date().toISOString(),
                }),
            };
        }

        const emailParams = {
            Source: SYSTEM_EMAIL,
            Destination: {
                ToAddresses: [SYSTEM_EMAIL, SECONDARY_EMAIL],
            },
            Message: {
                Subject: {
                    Data: `[CONTACT FORM] New message from ${name}`,
                },
                Body: {
                    Text: {
                        Data: `From: ${name} \n
                        Email ${email}:\n\n
                        ${content}`,
                    },
                },
            },
        };

        const command = new SendEmailCommand(emailParams);
        await sesClient.send(command);

        return {
            statusCode: 200,
            body: JSON.stringify({
                error: null,
                message: 'Success',
                date: new Date().toISOString(),
            }),
        };
    } catch (error) {
        console.error("Error sending email: ", error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'Internal Server Error',
                message: 'Failed to send email',
                date: new Date().toISOString(),
            }),
        };
    }
};
