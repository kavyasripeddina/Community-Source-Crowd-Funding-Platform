import { ShieldCheck, Info, HelpCircle, Phone, Lock, FileText, Settings } from 'lucide-react';

export const SimplePage = ({ title, icon: Icon, children }) => {
  return (
    <div className="bg-slate-50 min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12">
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
            <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600">
              <Icon className="w-7 h-7" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 font-display">{title}</h1>
          </div>
          <div className="prose prose-slate max-w-none prose-p:text-slate-600 prose-headings:text-slate-800">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export const HowItWorks = () => (
  <SimplePage title="How It Works" icon={Info}>
    <p>HopeBridge connects people who need help with people who care. Our platform allows anyone to start a fundraiser for verified medical emergencies, community causes, and social initiatives.</p>
    <ul className="space-y-4 my-6 list-none p-0">
      <li className="bg-slate-50 p-4 rounded-xl border border-slate-100"><strong>1. Start a Fundraiser:</strong> Create an account and set up your campaign with a clear goal and compelling story.</li>
      <li className="bg-slate-50 p-4 rounded-xl border border-slate-100"><strong>2. Share with Community:</strong> Share your campaign link with friends, family, and social networks.</li>
      <li className="bg-slate-50 p-4 rounded-xl border border-slate-100"><strong>3. Receive Donations:</strong> Donors can securely contribute exactly the amount you need.</li>
      <li className="bg-slate-50 p-4 rounded-xl border border-slate-100"><strong>4. Withdraw Funds:</strong> Once verified, funds go directly to the beneficiary's connected account.</li>
    </ul>
  </SimplePage>
);

export const Pricing = () => (
  <SimplePage title="Pricing & Fees" icon={Settings}>
    <p>We believe in maximizing the impact of every donation.</p>
    <div className="mt-8 space-y-6">
      <div>
        <h3 className="text-xl font-bold mb-2">0% Platform Fee</h3>
        <p>HopeBridge charges a 0% platform fee on all medical and emergency fundraisers. We rely on voluntary tips from donors to keep our servers running and our team supported.</p>
      </div>
      <div>
        <h3 className="text-xl font-bold mb-2">Payment Gateway Fees</h3>
        <p>Standard payment gateway processing fees (~1.5% to 2.5% depending on the payment method) are deducted directly by our payment processor partners. We do not profit from these gateway fees.</p>
      </div>
    </div>
  </SimplePage>
);

export const HelpCenter = () => (
  <SimplePage title="Help Center" icon={HelpCircle}>
    <p className="text-lg">Welcome to the HopeBridge Help Center. We're here to assist you.</p>
    <div className="mt-8 space-y-6">
      <div>
        <h3 className="text-xl font-bold mb-2">Managing Your Campaign</h3>
        <p>If you've started a campaign and need to edit details, log in to your Dashboard. For urgent changes affecting the beneficiary, please contact our support team.</p>
      </div>
      <div>
        <h3 className="text-xl font-bold mb-2">Donation Refunds</h3>
        <p>Refunds can be processed within 5 business days of the transaction, provided the funds have not yet been disbursed to the beneficiary. Please include your Transaction ID in any requests.</p>
      </div>
    </div>
  </SimplePage>
);

export const TrustAndSafety = () => (
  <SimplePage title="Trust & Safety" icon={ShieldCheck}>
    <p>Your security is our top priority. We employ rigorous verification processes for every fundraiser hosted on our platform.</p>
    <ul className="space-y-4 my-6 list-disc pl-5">
      <li><strong>Beneficiary Verification:</strong> All campaigns must provide valid ID and medical/financial documentation before funds can be withdrawn.</li>
      <li><strong>Fraud Prevention:</strong> We actively monitor transaction patterns and require an exact match for all manual UPI donations to deter misuse.</li>
      <li><strong>Secure Payments:</strong> We partner with industry-leading processors to ensure your payment data is encrypted and secure.</li>
    </ul>
  </SimplePage>
);

export const ContactUs = () => (
  <SimplePage title="Contact Us" icon={Phone}>
    <p>We'd love to hear from you. Whether you have a question about a campaign, need help setting up an account, or want to partner with us.</p>
    <div className="bg-slate-50 p-8 rounded-xl border border-slate-200 mt-8 text-center md:text-left">
      <p className="mb-4 text-lg">📧 <strong>Email:</strong> <a href="mailto:support@hopebridge.org" className="text-primary-600 hover:underline">support@hopebridge.org</a></p>
      <p className="mb-4 text-lg">📞 <strong>Phone:</strong> +91 (800) 123-4567</p>
      <p className="mb-0 text-lg">📍 <strong>Office:</strong> 123 Tech Park, Hyderabad, India</p>
    </div>
  </SimplePage>
);

export const LegalPolicies = ({ type }) => {
  const content = {
    terms: {
      title: "Terms of Service",
      icon: FileText,
      body: <><p>By using HopeBridge, you agree to these terms and conditions.</p><p>Users are strictly prohibited from creating fraudulent campaigns, misrepresenting beneficiaries, or manipulating the platform API.</p><p>We reserve the right to suspend any account or campaign that violates our community standards without prior notice.</p></>
    },
    privacy: {
      title: "Privacy Policy",
      icon: Lock,
      body: <><p>We respect your privacy. All personal data collected during the donation process is used strictly for verification and receipt generation.</p><p>We do not sell your personal data to third parties under any circumstances. Payment details are handled securely by our partnered processors.</p></>
    },
    cookie: {
      title: "Cookie Policy",
      icon: FileText,
      body: <><p>HopeBridge uses cookies to maintain user sessions and remember your preferences.</p><p>By continuing to use our website, you consent to our use of essential cookies specifically required to keep you logged securely into your account.</p></>
    }
  };
  
  const current = content[type];
  
  return (
    <SimplePage title={current.title} icon={current.icon}>
      <div className="space-y-4 text-lg leading-relaxed">
        {current.body}
      </div>
      <p className="text-sm text-slate-400 mt-12 pt-6 border-t border-slate-100 italic">Last updated: March 2026</p>
    </SimplePage>
  );
};
