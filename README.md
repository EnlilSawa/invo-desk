# InvoDesk - Freelancer Invoice Generator

A modern web application for freelancers to create professional invoices, send them via email, and collect digital signatures from clients.

## Features

- 📝 **Comprehensive Invoice Form** - Fill in client details, project information, and financial data
- 📄 **Professional PDF Generation** - Clean, professional invoice PDFs using pdf-lib
- 📧 **Email Integration** - Send invoices directly to clients using EmailJS
- ✍️ **Digital Signatures** - Collect client signatures using SignRequest API
- 🎨 **Modern UI** - Beautiful, responsive design with Tailwind CSS
- 📱 **Mobile Friendly** - Works perfectly on all devices

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **PDF Generation**: pdf-lib
- **Email Service**: EmailJS
- **Digital Signatures**: SignRequest API (with demo fallback)

## Getting Started

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd invo-desk
npm install
```

### 2. Environment Setup

Create a `.env.local` file in the root directory with the following variables:

```env
# EmailJS Configuration
# Get these from https://www.emailjs.com/
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_emailjs_public_key_here
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_emailjs_service_id_here
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_emailjs_template_id_here

# SignRequest API Configuration
# Get this from https://signrequest.com/
NEXT_PUBLIC_SIGNREQUEST_API_TOKEN=your_signrequest_api_token_here
```

### 3. EmailJS Setup

1. Go to [EmailJS](https://www.emailjs.com/) and create an account
2. Create a new email service (Gmail, Outlook, etc.)
3. Create an email template with variables:
   - `to_email`
   - `to_name`
   - `from_name`
   - `from_email`
   - `subject`
   - `message`
   - `signing_link`
4. Copy your Public Key, Service ID, and Template ID to your `.env.local` file

### 4. SignRequest Setup (Optional)

1. Go to [SignRequest](https://signrequest.com/) and create an account
2. Get your API token from the dashboard
3. Add it to your `.env.local` file

### 5. Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Usage

### Creating an Invoice

1. Fill out the client information (name, email, company, address)
2. Add project details (title, description, dates)
3. Enter financial information (hourly rate, hours, tax rate)
4. Add your freelancer information
5. Choose to either:
   - **Download PDF**: Generate and download the invoice
   - **Email to Client**: Send the invoice via email with a signature link

### Digital Signatures

When you choose to email the invoice:
- A signature link is generated and included in the email
- Clients can click the link to sign the invoice digitally
- You'll receive a confirmation when the invoice is signed

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
3. Add your environment variables in the Vercel dashboard
4. Deploy!

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

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

**Note**: This is a demo application. For production use, consider:
- Adding proper authentication
- Implementing a database to store invoices
- Adding payment processing integration
- Using a more robust e-signature service
- Adding invoice tracking and management features
