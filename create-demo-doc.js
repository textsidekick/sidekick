const { google } = require('googleapis');
const fs = require('fs');

const PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----
MIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDS/xTy8k2XryQP
kZcMJ1DwIiJlhjJ073iFzty5T4+j3y3/o3wRVWaFoGsQTfub2NMM/EElgMGt4w7e
zE33Mq5ggatTknD3wkq2qNmuY/25e2PbWqhYCIRr9s1zGBHkdenojcKtDSmaBfku
762EdY4PU7oqJT3Hv6/mTdy/XwT5zabJLvDN0JlXTR8J2jqVaQpdbnq+N/Z0wtBQ
vNFoYYzUgQ7VJMDw7jgC74ioDgYCTxvw5MIN70PQ0hQlYD5SpEmRiiuhxs7a0Bjq
hI9wOF2sQDph7ZhjcxBppWH7XTPcwQZRVRC5dopdVIZF1AX7mgfL1dpxBs/s3Pxa
rJdZosfXAgMBAAECggEAS5HZvnPjL4cmir7x0wQH3KHVIPiR/MjCKWagLmzc/OvT
zUIQDyM/r293uSS9D6H2YSm96YE2nSF8M3cIG5fW1bDLnIiQFmTLnqVWJbwhZTvY
1XkgXztZtlN0XRsLWYCT8NtJFPLoagZmq5VjV9REt5+cxziEapTwmrNbc11EanVD
Ajzxhpfzx1iVEC9DRA9BR6HrimqfRROqTkCPaUxWPHX13PbF1LBHgAy1yPg8sjnw
UYECJwbFhFD7CZfAG6CFUFZk2HBcKrYR3jMjqMhiPN5FoQX1etHNCWIGxnjhkux8
zkR3EUvfnDfbFwshIqfoSy+VgCk3lHob0VMQU0QHiQKBgQD9c5xB0WNjZD0ujadV
vyI1SG98i47wD1ynQrD2mHH22y4UNmaPCl+qU2aAlj16GrTWj//jRVgZ8IjxZAll
gBLjep4JDZepjlDQtR18c9xwxSAZTgvsn9N7NX+Lec4nar9GAwABnC68CB1TPHpc
GCdUIspzmAdP2C9fXOLsWXD/jwKBgQDVHjDgbgKlFnLRT9KYt8baap1Krj/kElCh
6MwKK1bsZJB+LdrgH//ikmhR09VcH86jM4UZgMzRKaRburdHa4Xo2QEusTQsIYHS
iAHp4AHqMf9o/FQHnr7vTgRdUH1BHUerY+WMbmiCgVlBsh/D4XZurSyHILt9r0jz
GROqhzePOQKBgQDMvyt5JD0lGuIuDHMk2v44iya9N0Sme9J+sGqjG23dXRzxaS0a
2ueDglJpCHXrgU2bk8LFB8zvT5hhYU4R+A/KQtEOQTPG3tg8ckO6uSJY23Zd2uXZ
JxhCDWrW8vRudVbFqUDFDDXY4rlF97JlWYHT/zMLhMJLZzqF0FTlWC/n0wKBgQCs
KfKUK2rpkKP6oYBgrP3wjnY40WF9zqni0lyazn4vA+KSfFq3+kHN+DZb/EP9Yxic
UM9yVdGgGwLSs5jCEoOgIkZJQRADoqHswMDC/ZquZeuOFWGQslZOnfj6pT46bvvp
4g6bjsnQu8uuPcZZiHcTW8R/+Rpdo0/MSvLPLOLeSQKBgQCfIWigc3+GvCkOYaNI
JTuySqvY3MWzn1F7rYtRX4k6FYttrXSypb/hBOvF488h3ALp3eVMIZDoEqwFmSjc
sre4Le8pW2oWJHD7DWEJwu1QwKHWesf0r+jCoEhEKHR8bPh0VksB01aZEXIjQmgm
M1GozSjh4pFSpB9uOKH8mMBvQw==
-----END PRIVATE KEY-----`;

const auth = new google.auth.JWT(
  'sidekick-sheets@arched-waters-485601-k0.iam.gserviceaccount.com',
  null,
  PRIVATE_KEY,
  ['https://www.googleapis.com/auth/documents', 'https://www.googleapis.com/auth/drive']
);

const content = fs.readFileSync('/data/.openclaw/workspace/ace-bed-demo-questions.md', 'utf8');

(async () => {
  const docs = google.docs({ version: 'v1', auth });
  const drive = google.drive({ version: 'v3', auth });

  // Create doc
  const doc = await docs.documents.create({
    requestBody: { title: 'Ace Bed Demo — Questions & Script (Jin Hwan)' }
  });
  const docId = doc.data.documentId;
  console.log('Doc created:', docId);

  // Insert content
  await docs.documents.batchUpdate({
    documentId: docId,
    requestBody: {
      requests: [{ insertText: { location: { index: 1 }, text: content } }]
    }
  });

  // Share with Justin
  await drive.permissions.create({
    fileId: docId,
    requestBody: { type: 'user', role: 'writer', emailAddress: 'so.justin8@gmail.com' }
  });
  // Also make it accessible via link
  await drive.permissions.create({
    fileId: docId,
    requestBody: { type: 'anyone', role: 'reader' }
  });

  console.log(`\nDoc URL: https://docs.google.com/document/d/${docId}/edit`);
})().catch(e => console.error('ERROR:', e.message));
