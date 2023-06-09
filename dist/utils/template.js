"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailTemplate = void 0;
const emailTemplate = ({ url }) => `
  <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
	<title>Your Message Subject or Title</title>
	<style type="text/css">
		#outlook a {padding:0;}
		body{width:100% !important; -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; margin:0; padding:0;}
		.container {
			display: flex;
			align-items: center;
			juustify-content: center;
			flex-direction: column;
		}
		.ExternalClass {width:100%;}
		.ExternalClass, .ExternalClass p, .ExternalClass span, .ExternalClass font, .ExternalClass td, .ExternalClass div {line-height: 100%;}
		img {outline:none; text-decoration:none; -ms-interpolation-mode: bicubic;}
		a img {border:none;}
		.image_fix {display:block; max-width: 400px}
		p {margin: 1em 0;}
		h1, h2, h3, h4, h5, h6 {color: black !important;}
		h1 a, h2 a, h3 a, h4 a, h5 a, h6 a {color: blue !important;}
		h1 a:active, h2 a:active,  h3 a:active, h4 a:active, h5 a:active, h6 a:active {
			color: red !important;
		 }
		h1 a:visited, h2 a:visited,  h3 a:visited, h4 a:visited, h5 a:visited, h6 a:visited {
			color: purple !important;
		}
				a {display: block; color: orange; margin: 20px 0; font-size: 16px; font-weight: bold;}
		@media only screen and (max-device-width: 480px) {
		.mobile_link a[href^="home"] {
						text-decoration: default;
						color: orange !important; /* or whatever your want */
						pointer-events: auto;
						cursor: default;
					}
		}
		@media only screen and (min-device-width: 768px) and (max-device-width: 1024px) {
			.mobile_link a[href$="3000"] {
						text-decoration: default;
						color: orange !important;
						pointer-events: auto;
						cursor: default;
					}
		}
	</style>
</head>
<body>
	<div class="container">
      <a href="${url}" title="Reset Password" style="color: orange; text-decoration: none;">Reset Your Password</a>
      <img class="image_fix" src="https://images.pexels.com/photos/2882630/pexels-photo-2882630.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Forgot password image" title="Reset Your Password" width="x" height="x" />
      <span class="mobile_link">
        <a href="http://localhost:3000"></a>
      </span>
	</div>
</body>
</html>
`;
exports.emailTemplate = emailTemplate;
//# sourceMappingURL=template.js.map