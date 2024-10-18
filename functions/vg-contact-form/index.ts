import {SESClient, SendEmailCommand} from "@aws-sdk/client-ses";

const {
    SYSTEM_EMAIL,
    SECONDARY_EMAIL,
    AWS_REGION,
    CF_CAPTCHA_SECRET,
} = process.env;

// @TODO Test sleep(5/6/7/8/9/10/11/12 seconds)

const sesClient = new SESClient({region: AWS_REGION});
export const handler = async (event) => {
    try {
        const {name, email, content, captchaToken} = JSON.parse(event.body);
        if (!name || !email || !content || !captchaToken) {
            return {
                statusCode: 400,
                body: JSON.stringify({message: "name, email, content and captchaToken are required"}),
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
                body: JSON.stringify({message: "Captcha verification failed"}),
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
                        Data: `New message from ${name} (${email}):\n\n${content}`,
                    },
                },
            },
        };

        const command = new SendEmailCommand(emailParams);
        await sesClient.send(command);
        return {
            statusCode: 200,
            body: JSON.stringify({message: "Email sent successfully!"}),
        };
    } catch (error) {
        console.error("Error sending email: ", error);

        return {
            statusCode: 500,
            body: JSON.stringify({message: "Failed to send email", error: error.message}),
        };
    }
};
