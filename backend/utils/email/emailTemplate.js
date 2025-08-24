const templates = {
  'registration-success': {
    header: 'Registration Successful',
    message: `Welcome to XYZ School. To get started,
      you just need to verify your email address.<br/>
      Click the link below to verify.`,
    url: 'https://www.google.com',
    urlText: 'Verify Email',
  },
  verification: {
    header: 'Email Verification',
    message: `Your email verification is pending.<br/>
      You need to verify your email address.<br/>
      Click the link below.`,
    url: 'https://www.google.com',
    urlText: 'Verify Email',
  },
  'verification-success': {
    header: 'Email Verification Successful',
    message: `Your email has been verified.<br/>
      Thank you for your cooperation.`,
  },
  reset: {
    header: 'Reset Your Password',
    message: `You recently requested to reset the password for your account.
    To complete this action, click the link below.`,
    url: 'https://www.google.com',
    urlText: 'Verify Email',
    note: `This link is valid for 15 minutes.<br/>
    <span style="color: #985959; margin-bottom: 10px;">
    If you did not request password reset, please ignore this email.
    </span>`,
  },
  'reset-success': {
    header: 'Your Password Has Changed',
    message: `You recently requested to reset the password for your account.
    To complete this action, click the link below.`,
    url: 'https://www.google.com',
    urlText: 'Verify Email',
    note: `<span style="color: #985959; margin-bottom: 10px;">
    If it was not changed by you, please contact the support team.
    </span><br/><span style="margin-bottom: 10px; font-size: 12px;">
    Contact: 9876543210 | Mail: support@example.com  
    </span>`,
  },
};

export const purposeOptions = {
  registrationSuccess: 'registration-success',
  verification: 'verification',
  verificationSuccess: 'verification-success',
  reset: 'reset',
  resetSuccess: 'reset-success',
};

const templateEmail = (name, purpose='reset') => {
  const t = templates[purpose];
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta charset="UTF-8" />
    <title>Email</title>
  </head>
  <body style="margin:0; padding:0 10px; font-family:Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f6f9; padding:20px 0">
      <tbody>
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff; border-radius:10px; overflow:hidden; padding:20px 10px;">
              <tbody>
                <tr>
                  <td align="center" style="padding:20px">
                    <img src="https://res.cloudinary.com/df1pd1iyx/image/upload/v1755877685/logo_thgitf.jpg" alt="Logo" width="60" style="display:block"/>
                  </td>
                </tr>

                <tr>
                  <td align="center" style="font-size:20px; font-weight:bold; color:#004144; padding:10px;">
                    ${t.header}
                  </td>
                </tr>

                <tr>
                  <td align="center" style="padding:20px 10px; font-size:14px; color:#476365ff; line-height:1.6;">
                    <span style="font-weight:bold;">Hi ${name}</span>,<br/>
                    ${t.message}
                  </td>
                </tr>

                ${
                  t.url
                    ? `<tr>
                        <td align="center" style="padding:20px 10px">
                          <a href="${t.url}" style="background-color:#007bff; color:#ffffff; text-decoration:none; padding:12px 24px; border-radius:5px; font-size:16px; display:inline-block;">
                            ${t.urlText}
                          </a>
                        </td>
                      </tr>`
                    : ''
                }

                ${
                  t.note
                    ? `<tr>
                        <td align="center" style="padding:20px 10px; font-size:14px; color:#476365ff; line-height:1.6;">
                          ${t.note}
                        </td>
                      </tr>`
                    : ''
                }

                <tr>
                  <td align="center" style="padding:20px; line-height:1.4; font-size:12px;">
                    <hr style="width:80%; margin-bottom:20px; border:.5px solid #cbcbcb;"/>
                    <span style="color:#677b7d">
                      Copyright &copy; ${new Date().getFullYear()} School
                      Management.<br/>All rights reserved.
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  </body>
</html>`;
};

export default templateEmail;