import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Heart,
  Briefcase,
  Users,
  Home as HomeIcon,
  ArrowRight,
  Lock,
} from 'lucide-react';
import GuestContext from '../contexts/GuestContext';

const LinkCard = ({ href, title, description }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="p-5 rounded-lg border bg-white/70 dark:bg-gray-800/60 hover:border-primary-500 hover:shadow transition-colors block"
  >
    <h4 className="font-semibold mb-1 text-primary-700 dark:text-primary-300">{title}</h4>
    <p className="text-sm text-gray-600 dark:text-gray-300">{description}</p>
  </a>
);

const ConnectCard = ({ icon: Icon, title, description, onClick }) => (
  <div className="rounded-xl border bg-white dark:bg-gray-800 p-6 flex flex-col">
    <div className="flex items-center gap-3 mb-3">
      <Icon className="w-6 h-6 text-primary-600" />
      <h4 className="font-semibold">{title}</h4>
    </div>
    <p className="text-sm text-gray-600 dark:text-gray-300 flex-1">{description}</p>
    <button onClick={onClick} className="mt-4 inline-flex items-center gap-2 text-primary-600 hover:text-primary-700">
      Start {title} Sync <ArrowRight className="w-4 h-4" />
    </button>
  </div>
);

const Tier = ({ title, benefits, requirements, active }) => (
  <div className={`rounded-xl border p-5 ${active ? 'border-primary-500' : 'border-gray-200 dark:border-gray-700'} bg-white dark:bg-gray-800`}>
    <h4 className="font-semibold mb-2">{title}</h4>
    <div className="text-sm mb-2">
      <div className="font-medium">Benefits:</div>
      <ul className="list-disc list-inside text-gray-600 dark:text-gray-300">
        {benefits.map((b, i) => <li key={i}>{b}</li>)}
      </ul>
    </div>
    <div className="text-sm">
      <div className="font-medium">Requirements:</div>
      <ul className="list-disc list-inside text-gray-600 dark:text-gray-300">
        {requirements.map((r, i) => <li key={i}>{r}</li>)}
      </ul>
    </div>
  </div>
);

const Welcome = () => {
  // Removed unused guestData to satisfy ESLint
  useContext(GuestContext);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
              Discover Your Perfect Sync
            </h1>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
              Experience the future of relationships through the Salatiso Ecosystem. Connect meaningfully in romance, business, friendship, and kinship using LifeCV, Family Value, and The Hub.
            </p>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => navigate('/onboarding')} className="px-5 py-3 rounded-lg bg-primary-600 text-white hover:bg-primary-700 inline-flex items-center gap-2">
                Get Started <ArrowRight className="w-4 h-4" />
              </button>
              <button onClick={() => navigate('/instant-trust')} className="px-5 py-3 rounded-lg bg-white dark:bg-gray-800 border hover:bg-gray-50 dark:hover:bg-gray-700 inline-flex items-center gap-2">
                Instant Trust Verification
              </button>
              <button onClick={() => navigate('/follow-me-home')} className="px-5 py-3 rounded-lg bg-white dark:bg-gray-800 border hover:bg-gray-50 dark:hover:bg-gray-700 inline-flex items-center gap-2">
                Follow Me Home
              </button>
              <button onClick={() => navigate('/dashboard')} className="px-5 py-3 rounded-lg bg-white dark:bg-gray-800 border hover:bg-gray-50 dark:hover:bg-gray-700 inline-flex items-center gap-2">
                Dashboard
              </button>
            </div>
          </div>
          <div className="rounded-2xl bg-white/70 dark:bg-gray-800/60 border p-6">
            <div className="text-sm text-gray-500 mb-2">
              The Heart powering the Salatiso Ecosystem | Powered by{' '}
              <a href="https://the-hub-lifecv.web.app/" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">The Hub</a>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <LinkCard
                href="https://pigeeback-lifecv.web.app/"
                title="PigeeBack"
                description="Community logistics and peer delivery"
              />
              <LinkCard
                href="https://ekhaya-lifecv.web.app/"
                title="Ekhaya"
                description="Household coordination and community home life"
              />
              <LinkCard
                href="https://familyvalue-lifecv.web.app/"
                title="Family Value"
                description="Recognize and quantify your family contributions"
              />
              <LinkCard
                href="https://the-hub-lifecv.web.app/login"
                title="LifeCV"
                description="Your complete digital identity and skills ledger"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Four Ways to Connect */}
      <section className="max-w-6xl mx-auto px-4 pb-12">
        <h2 className="text-2xl md:text-3xl font-bold mb-6">Four Ways to Connect</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-6">Choose your context and discover compatibility</p>
        <div className="grid md:grid-cols-2 gap-6">
          <ConnectCard
            icon={Heart}
            title="Romance"
            description="Discover romantic compatibility through comprehensive assessments covering values, lifestyle, relationship dynamics, and practical considerations. Set up safe meetings with location sharing, emergency contacts, and offline connectivity options."
            onClick={() => navigate('/solo?context=romance')}
          />
          <ConnectCard
            icon={Briefcase}
            title="Business"
            description="Connect with collaborators who share your work style, risk tolerance, and strategic vision for successful business partnerships."
            onClick={() => navigate('/solo?context=business')}
          />
          <ConnectCard
            icon={Users}
            title="Friendship"
            description="Build lasting friendships by discovering shared interests, communication styles, and social preferences with our friendship compatibility engine."
            onClick={() => navigate('/solo?context=friendship')}
          />
          <ConnectCard
            icon={HomeIcon}
            title="Kinship"
            description="Explore potential family connections through shared heritage, ancestral data, and cultural traditions with our kinship discovery engine."
            onClick={() => navigate('/solo?context=kinship')}
          />
        </div>
      </section>

      {/* Trust Tiers */}
      <section className="max-w-6xl mx-auto px-4 pb-12">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">Build Trust, Unlock Features</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-6">Enhance your profile with our tiered verification system for better matches and premium features</p>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="text-sm text-gray-500">Trust Score: 35/100</div>
            <Tier
              title="Basic Profile"
              benefits={[
                'View listings',
                'Basic sync access',
                'Community forums'
              ]}
              requirements={[
                'Valid email address'
              ]}
              active
            />
          </div>
          <Tier
            title="Identity Confirmed"
            benefits={[
              'Full sync features',
              'Compatibility reports',
              'Verified badge'
            ]}
            requirements={[
              'Government ID verification',
              'Address confirmation'
            ]}
          />
          <Tier
            title="Enhanced Screening"
            benefits={[
              'Priority matching',
              'Advanced insights',
              'Cross-platform trust'
            ]}
            requirements={[
              'Background check',
              'Biometric verification'
            ]}
          />
        </div>
        <div className="mt-6 rounded-xl border bg-white dark:bg-gray-800 p-5 flex items-start gap-3">
          <Lock className="w-5 h-5 text-primary-600 mt-0.5" />
          <div>
            <h4 className="font-semibold mb-1">Privacy & Security</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">All verification data is encrypted and securely stored. We never share your personal information without consent.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="rounded-2xl border bg-white dark:bg-gray-800 p-8 text-center">
          <div className="inline-flex items-center gap-2 text-primary-600 mb-2">
            <Shield className="w-5 h-5" />
            <span>Build Trust, Connect Safely</span>
          </div>
          <h3 className="text-2xl font-bold mb-6">Join thousands discovering meaningful connections through the Salatiso Ecosystem</h3>
          <div className="flex flex-wrap justify-center gap-3">
            <button onClick={() => navigate('/instant-trust')} className="px-5 py-3 rounded-lg bg-primary-600 text-white hover:bg-primary-700 inline-flex items-center gap-2">
              Start Instant Trust Verification
            </button>
            <button onClick={() => navigate('/solo')} className="px-5 py-3 rounded-lg bg-white dark:bg-gray-900 border hover:bg-gray-50 dark:hover:bg-gray-800 inline-flex items-center gap-2">
              Explore Solo Experience
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Welcome;