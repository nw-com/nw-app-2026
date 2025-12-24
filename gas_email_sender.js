// Google Apps Script Code for Free Email Sending
// How to use:
// 1. Go to https://script.google.com/
// 2. Create a new project.
// 3. Copy and paste this code into the editor (replace existing code).
// 4. Save the project (File > Save).
// 5. Deploy as Web App:
//    - Click "Deploy" > "New deployment".
//    - Select "Web app".
//    - Description: "Email Sender".
//    - Execute as: "Me" (your Google account).
//    - Who has access: "Anyone" (allows your app to call it).
//    - Click "Deploy".
//    - Authorize access when prompted.
// 6. Copy the "Web App URL" (starts with https://script.google.com/macros/s/...).
// 7. Paste this URL into the settings in your application.

function doPost(e) {
  try {
    // Parse the incoming JSON data
    var data = JSON.parse(e.postData.contents);
    var to = data.to;
    var subject = data.subject;
    var htmlBody = data.htmlBody;
    var attachments = data.attachments || []; // Expecting array of {fileName, mimeType, contentBase64}

    // Validate required fields
    if (!to || !subject || !htmlBody) {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'error',
        message: 'Missing required fields: to, subject, or htmlBody'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Process attachments
    var blobs = [];
    if (attachments && attachments.length > 0) {
      for (var i = 0; i < attachments.length; i++) {
        var att = attachments[i];
        if (att.contentBase64 && att.fileName && att.mimeType) {
          var decoded = Utilities.base64Decode(att.contentBase64);
          var blob = Utilities.newBlob(decoded, att.mimeType, att.fileName);
          blobs.push(blob);
        }
      }
    }

    // Send email
    // Note: 'noReply: true' might not work for all Gmail accounts, but we can try.
    // 'name': 'Finance Report System' sets the sender name.
    MailApp.sendEmail({
      to: to,
      subject: subject,
      htmlBody: htmlBody,
      attachments: blobs,
      name: '財務報表系統' 
    });

    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Email sent successfully'
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput("Email Sender Service is running.");
}
