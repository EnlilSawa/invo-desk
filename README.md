# InvoDesk - Freelancer Invoice Generator

A modern web application for freelancers to create professional invoices, send them via email, and collect digital signatures from clients. **No complex APIs required!**

## Features

- 📝 **Comprehensive Invoice Form** - Fill in client details, project information, and financial data
- 📄 **Professional PDF Generation** - Clean, professional invoice PDFs using pdf-lib
- 📧 **Simple Email Options** - Send invoices via EmailJS OR copy email templates
- ✍️ **Digital Signatures** - DocuSign integration OR simple local signatures
- 🎨 **Modern UI** - Beautiful, responsive design with Tailwind CSS
- 📱 **Mobile Friendly** - Works perfectly on all devices
- 🚀 **Zero Configuration** - Works immediately without setup

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **PDF Generation**: pdf-lib
- **Email Service**: EmailJS (optional) + email templates
- **Digital Signatures**: DocuSign API (optional) + simple local storage fallback

## Getting Started

### 1. Clone and Install

```bash
git clone https://github.com/EnlilSawa/invo-desk.git
cd invo-desk
npm install
```

### 2. Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

**That's it!** The application works immediately without any configuration.

## Usage

### Creating an Invoice

1. Fill out the client information (name, email, company, address)
2. Add project details (title, description, dates)
3. Enter financial information (hourly rate, hours, tax rate)
4. Add your freelancer information
5. Choose your action:
   - **Download PDF**: Generate and download the invoice
   - **Auto Email**: Send via EmailJS (if configured)
   - **Copy Email**: Get email template to copy and paste

### Digital Signatures

- When you choose email options, a signature link is generated
- Clients can click the link to sign the invoice digitally
- Signatures are stored securely in the browser
- No external services or APIs required

## EmailJS Setup (Optional)

If you want automatic email sending:

1. Go to [EmailJS](https://www.emailjs.com/) and create an account
2. Choose **"Personal Service"** (not Transactional)
3. Connect your Gmail, Outlook, or other email
4. Create an email template with variables:
   - `to_email`
   - `to_name`
   - `from_name`
   - `from_email`
   - `subject`
   - `message`
   - `signing_link`
5. Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key
   NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id
   NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_template_id
   ```

**Note**: EmailJS is completely optional. You can use the "Copy Email" option to get email templates and send them manually.

## DocuSign Setup (Optional)

If you want professional digital signatures:

1. Go to [DocuSign Developer Center](https://developers.docusign.com/) and create an account
2. Create a new app and get your credentials:
   - Account ID
   - Integration Key
   - User ID
   - Private Key (RSA key pair)
3. Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_DOCUSIGN_ACCOUNT_ID=your_account_id
   NEXT_PUBLIC_DOCUSIGN_INTEGRATION_KEY=your_integration_key
   NEXT_PUBLIC_DOCUSIGN_USER_ID=your_user_id
   NEXT_PUBLIC_DOCUSIGN_PRIVATE_KEY=your_private_key
   ```

**Note**: DocuSign is completely optional. The app will use a simple signature system if DocuSign is not configured.

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── sign-invoice/      # Signature pages
├── components/            # React components
│   └── InvoiceForm.tsx    # Main invoice form
├── types/                 # TypeScript types
│   └── invoice.ts         # Invoice data types
└── utils/                 # Utility functions
    ├── pdfGenerator.ts    # PDF generation logic
    ├── emailService.ts    # Email sending logic
    └── signatureService.ts # Digital signature logic
```

## Customization

### Styling
The application uses Tailwind CSS. You can customize the design by modifying the classes in the components.

### PDF Template
Edit `src/utils/pdfGenerator.ts` to customize the PDF layout and styling.

### Email Template
Modify the email content in `src/utils/emailService.ts` to change the email format.

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy!

The application works immediately without any environment variables.

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Why This Approach?

- **No Complex APIs**: No need to deal with SignRequest, DocuSign, or other complex services
- **Works Immediately**: PDF generation and signatures work out of the box
- **Simple Email**: Either use EmailJS or copy email templates manually
- **Secure**: Signatures stored locally, no external dependencies
- **Free**: No monthly fees or API costs

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - feel free to use this project for your own needs!

## Support

If you encounter any issues or have questions, please open an issue on GitHub.

---

**Perfect for**: Freelancers, consultants, small businesses who want a simple, effective invoicing solution without the complexity of external APIs.
