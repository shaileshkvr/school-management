const templateEmail = ({ header, user, purpose, url, urlText }) => `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta charset="UTF-8" />
    <title>Email</title>
  </head>
  <body
    style="
      margin: 0;
      padding: 0 20px;
      font-family: Arial, sans-serif;
    "
  >
    <table
      width="100%"
      cellpadding="0"
      cellspacing="0"
      border="0"
      style="background-color: #f4f6f9; padding: 20px 0"
    >
      <tbody>
        <tr>
          <td align="center">
            <!-- Container -->
            <table
              width="600"
              cellpadding="0"
              cellspacing="0"
              border="0"
              style="
                background-color: #ffffff;
                border-radius: 16px;
                overflow: hidden;
                padding: 20px;
              "
            >
              <!-- Logo -->
              <tbody>
                <tr>
                  <td align="center" style="padding: 20px">
                    <img src="https://res.cloudinary.com/df1pd1iyx/image/upload/v1755877685/logo_thgitf.jpg" alt="Logo" width="60" style="display: block" />
                  </td>
                </tr>

                <!-- Heading -->
                <tr>
                  <td
                    align="center"
                    style="
                      font-size: 24px;
                      font-weight: bold;
                      color: #004144;
                      padding: 10px;
                    "
                  >
                    ${header}
                  </td>
                </tr>

                <!-- Message -->
                <tr>
                  <td
                    align="center"
                    style="
                      padding: 20px;
                      font-size: 16px;
                      color: #476365ff;
                      line-height: 1.6;
                    "
                  >
                    Hi
                    <span
                      style="font-weight: bold;"
                      >${user}</span
                    >,<br />
                    This mail was sent to you to ${purpose}.<br />
                    Please click the link below to proceed.
                  </td>
                </tr>

                <!-- Button -->
                <tr>
                  <td align="center" style="padding: 20px">
                    <a
                      href="${url}"
                      style="
                        background-color: #007bff;
                        color: #ffffff;
                        text-decoration: none;
                        padding: 12px 24px;
                        border-radius: 5px;
                        font-size: 16px;
                        display: inline-block;
                      "
                    >
                      ${urlText}
                    </a>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td align="center" style="padding: 20px; line-height: 1.4; font-size: 12px;">
                    <hr style="width:80%; margin-bottom: 20px; border: .5px solid #cbcbcb;"/>
                    <span style="color: #985959; margin-bottom: 10px;">
                      If you did not request this email, please ignore
                      it.
                    </span>
                    <br />
                    <span style="color: #677b7d">
                      Copyright &copy; ${new Date().getFullYear()} School
                      Management. All rights reserved.
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
</html>
`;

export default templateEmail;
