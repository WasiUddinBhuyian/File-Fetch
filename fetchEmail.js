const imaps = require('imap-simple');
const { simpleParser } = require('mailparser');
const fs = require('fs');
const path = require('path');

const email = "wasiuddinbhuyian71@gmail.com";
const appPassword = "vsuf psnt pxuh liom";
const imapConfig = {
    user: email,
    password: appPassword,
    host: "imap.gmail.com",
    port: 993,
    tls: true,
    tlsOptions: {
        secureProtocol: "TLSv1_2_method",
        rejectUnauthorized: true,
    },
};

const config = {
    imap: {
        user: email,
        password: appPassword,
        host: 'imap.gmail.com',
        port: 993,
        tls: true,
        tlsOptions: {
            secureProtocol: "TLSv1_2_method",
            rejectUnauthorized: true,
        },
        authTimeout: 3000
    }
};

async function retrieveAttachments() {
    try {
        const connection = await imaps.connect(config);
        await connection.openBox('INBOX');

        const searchCriteria = ['ALL'];
        const fetchOptions = {
            bodies: ['HEADER', 'TEXT'],
            struct: true
        };

        const messages = await connection.search(searchCriteria, fetchOptions);

        const downloadFolder = path.join(__dirname, 'downloads');
        if (!fs.existsSync(downloadFolder)) {
            fs.mkdirSync(downloadFolder);
        }

        for (const message of messages) {
            const parts = imaps.getParts(message.attributes.struct);
            for (const part of parts) {
                if (part.disposition && part.disposition.type.toUpperCase() === 'ATTACHMENT') {
                    const filename = part.disposition.params.filename;

                    if (filename.toLowerCase().includes('cv')) {
                        const partData = await connection.getPartData(message, part);
                        const filePath = path.join(downloadFolder, filename);

                        fs.writeFileSync(filePath, partData);
                        console.log(`Attachment saved: ${filePath}`);
                    }
                }
            }
        }
        connection.end();
    } catch (error) {
        console.error('Error retrieving attachments:', error);
    }
}

retrieveAttachments();