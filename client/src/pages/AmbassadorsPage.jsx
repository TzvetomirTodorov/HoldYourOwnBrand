/**
 * Ambassadors Page
 * 
 * Showcases HYOW brand ambassadors and influencer collaborations.
 * Features Stew Money as the primary artist representative.
 * 
 * Inspired by: KITH athletes, Fear of God essentials partnerships
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';

// ═══════════════════════════════════════════════════════════════════════════
// AMBASSADOR DATA
// ═══════════════════════════════════════════════════════════════════════════

const FEATURED_AMBASSADOR = {
  id: 'stew-money',
  name: 'Stew Money',
  title: 'Founding Artist',
  location: 'California',
  image: '/images/ambassadors/stew-money.jpg',
  coverImage: '/images/ambassadors/stew-money-cover.jpg',
  bio: `Stew Money represents the intersection of street culture and artistic expression that defines HYOW. As our founding artist partner, his vision shapes the creative direction of exclusive drops and limited collaborations.`,
  quote: `"Fashion is the armor to survive the reality of everyday life."`,
  social: {
    instagram: 'https://instagram.com/stewmoney',
    twitter: 'https://twitter.com/stewmoney',
    spotify: 'https://open.spotify.com/artist/stewmoney',
  },
  stats: {
    followers: '250K+',
    collaborations: '12',
    exclusiveDrops: '8',
  },
  collections: [
    {
      id: 'stew-money-ss26',
      name: 'STEW MONEY × HYOW SS26',
      image: '/images/collections/stew-money-ss26.jpg',
      slug: 'stew-money-ss26',
    },
  ],
};

const AMBASSADORS = [
  FEATURED_AMBASSADOR,
  {
    id: 'ambassador-2',
    name: 'Coming Soon',
    title: 'Next Ambassador',
    location: 'TBA',
    image: '/images/ambassadors/placeholder.jpg',
    bio: 'The next chapter of HYOW collaborations is being written.',
    quote: '???',
    comingSoon: true,
  },
  {
    id: 'ambassador-3',
    name: 'Your Name Here?',
    title: 'Future Partner',
    location: 'Worldwide',
    image: '/images/ambassadors/apply.jpg',
    bio: 'We\'re always looking for authentic voices that resonate with our community.',
    quote: 'Apply to become an ambassador',
    isApplication: true,
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// ICONS
// ═══════════════════════════════════════════════════════════════════════════

const InstagramIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"/>
  </svg>
);

const TwitterIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const SpotifyIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
  </svg>
);

const ArrowRightIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
  </svg>
);

// ═══════════════════════════════════════════════════════════════════════════
// AMBASSADOR CARD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

function AmbassadorCard({ ambassador, featured = false }) {
  if (ambassador.comingSoon) {
    return (
      <div className="group relative aspect-[3/4] bg-gradient-to-br from-neutral-200 to-neutral-300 dark:from-neutral-800 dark:to-neutral-900 rounded-2xl overflow-hidden">
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 rounded-full bg-neutral-300 dark:bg-neutral-700 flex items-center justify-center mb-4">
            <span className="text-4xl">?</span>
          </div>
          <h3 className="text-xl font-bold mb-1">{ambassador.name}</h3>
          <p className="text-sm text-neutral-500">{ambassador.title}</p>
        </div>
        
        {/* Animated border */}
        <div className="absolute inset-0 rounded-2xl border-2 border-dashed border-neutral-400 dark:border-neutral-600 animate-pulse" />
      </div>
    );
  }

  if (ambassador.isApplication) {
    return (
      <Link 
        to="/ambassador-application"
        className="group relative aspect-[3/4] bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-900 rounded-2xl overflow-hidden border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-black dark:hover:border-white transition-colors duration-300"
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 rounded-full border-2 border-neutral-400 dark:border-neutral-600 flex items-center justify-center mb-4 group-hover:border-black dark:group-hover:border-white transition-colors">
            <span className="text-3xl group-hover:scale-110 transition-transform">+</span>
          </div>
          <h3 className="text-xl font-bold mb-1">{ambassador.name}</h3>
          <p className="text-sm text-neutral-500 mb-4">{ambassador.quote}</p>
          <span className="inline-flex items-center gap-2 text-sm font-medium group-hover:gap-3 transition-all">
            Apply Now
            <ArrowRightIcon className="w-4 h-4" />
          </span>
        </div>
      </Link>
    );
  }

  return (
    <div className={`group relative ${featured ? 'col-span-2 row-span-2' : ''} aspect-[3/4] rounded-2xl overflow-hidden`}>
      {/* Background Image */}
      <div className="absolute inset-0 bg-neutral-200 dark:bg-neutral-800">
        <img 
          src={ambassador.image} 
          alt={ambassador.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
        {/* Tags */}
        <div className="flex gap-2 mb-3">
          <span className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded text-xs uppercase tracking-wider">
            {ambassador.title}
          </span>
          <span className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded text-xs">
            📍 {ambassador.location}
          </span>
        </div>

        {/* Name */}
        <h3 className={`font-bold mb-2 ${featured ? 'text-4xl' : 'text-2xl'}`}>
          {ambassador.name}
        </h3>

        {/* Quote */}
        <p className={`text-white/80 italic mb-4 ${featured ? 'text-lg' : 'text-sm'} line-clamp-2`}>
          {ambassador.quote}
        </p>

        {/* Social Links */}
        {ambassador.social && (
          <div className="flex gap-3">
            {ambassador.social.instagram && (
              <a 
                href={ambassador.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              >
                <InstagramIcon className="w-5 h-5" />
              </a>
            )}
            {ambassador.social.twitter && (
              <a 
                href={ambassador.social.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              >
                <TwitterIcon className="w-5 h-5" />
              </a>
            )}
            {ambassador.social.spotify && (
              <a 
                href={ambassador.social.spotify}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              >
                <SpotifyIcon className="w-5 h-5" />
              </a>
            )}
          </div>
        )}
      </div>

      {/* View Profile Button - appears on hover */}
      <Link 
        to={`/ambassadors/${ambassador.id}`}
        className="absolute top-4 right-4 px-4 py-2 bg-white text-black text-sm font-medium rounded-full opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:bg-neutral-100"
      >
        View Profile
      </Link>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function AmbassadorsPage() {
  const [activeTab, setActiveTab] = useState('all');

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-900 dark:to-black">
          <img 
            src={FEATURED_AMBASSADOR.coverImage || FEATURED_AMBASSADOR.image}
            alt="Ambassadors"
            className="w-full h-full object-cover opacity-30 dark:opacity-20"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-neutral-950 via-transparent to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-neutral-500 mb-4">
            The HYOW Collective
          </p>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
            AMBASSADORS
          </h1>
          <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            The visionaries, artists, and cultural leaders who shape the HYOW identity. 
            Authentic voices. Uncompromising style.
          </p>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-neutral-400 flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-neutral-400 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Featured Ambassador */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="flex items-center gap-4 mb-8">
          <span className="px-3 py-1 bg-black dark:bg-white text-white dark:text-black text-xs font-bold uppercase tracking-wider rounded-full">
            Featured
          </span>
          <h2 className="text-2xl font-bold">Founding Artist</h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Image */}
          <div className="aspect-square rounded-3xl overflow-hidden bg-neutral-200 dark:bg-neutral-800">
            <img 
              src={FEATURED_AMBASSADOR.image}
              alt={FEATURED_AMBASSADOR.name}
              className="w-full h-full object-cover"
              onError={(e) => { 
                e.target.parentElement.innerHTML = `
                  <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-300 to-neutral-400 dark:from-neutral-700 dark:to-neutral-800">
                    <span class="text-6xl font-bold text-white/30">${FEATURED_AMBASSADOR.name.split(' ').map(n => n[0]).join('')}</span>
                  </div>
                `;
              }}
            />
          </div>

          {/* Details */}
          <div className="flex flex-col justify-center">
            <p className="text-sm uppercase tracking-wider text-neutral-500 mb-2">
              📍 {FEATURED_AMBASSADOR.location}
            </p>
            <h3 className="text-5xl font-bold mb-4">{FEATURED_AMBASSADOR.name}</h3>
            <p className="text-2xl italic text-neutral-600 dark:text-neutral-400 mb-6">
              {FEATURED_AMBASSADOR.quote}
            </p>
            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed mb-8">
              {FEATURED_AMBASSADOR.bio}
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="text-center p-4 bg-neutral-100 dark:bg-neutral-900 rounded-xl">
                <div className="text-2xl font-bold">{FEATURED_AMBASSADOR.stats.followers}</div>
                <div className="text-sm text-neutral-500">Followers</div>
              </div>
              <div className="text-center p-4 bg-neutral-100 dark:bg-neutral-900 rounded-xl">
                <div className="text-2xl font-bold">{FEATURED_AMBASSADOR.stats.collaborations}</div>
                <div className="text-sm text-neutral-500">Collaborations</div>
              </div>
              <div className="text-center p-4 bg-neutral-100 dark:bg-neutral-900 rounded-xl">
                <div className="text-2xl font-bold">{FEATURED_AMBASSADOR.stats.exclusiveDrops}</div>
                <div className="text-sm text-neutral-500">Exclusive Drops</div>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-4 mb-8">
              {FEATURED_AMBASSADOR.social?.instagram && (
                <a 
                  href={FEATURED_AMBASSADOR.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  <InstagramIcon className="w-5 h-5" />
                  <span>Instagram</span>
                </a>
              )}
              {FEATURED_AMBASSADOR.social?.twitter && (
                <a 
                  href={FEATURED_AMBASSADOR.social.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  <TwitterIcon className="w-5 h-5" />
                  <span>Twitter</span>
                </a>
              )}
              {FEATURED_AMBASSADOR.social?.spotify && (
                <a 
                  href={FEATURED_AMBASSADOR.social.spotify}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  <SpotifyIcon className="w-5 h-5" />
                  <span>Spotify</span>
                </a>
              )}
            </div>

            {/* CTA */}
            <Link 
              to="/shop?collection=stew-money"
              className="inline-flex items-center gap-2 px-8 py-4 bg-black dark:bg-white text-white dark:text-black font-medium rounded-full hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors group"
            >
              Shop the Collection
              <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Ambassador Grid */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold mb-12 text-center">The Collective</h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {AMBASSADORS.slice(1).map((ambassador) => (
            <AmbassadorCard key={ambassador.id} ambassador={ambassador} />
          ))}
        </div>
      </section>

      {/* Apply CTA */}
      <section className="bg-black dark:bg-white text-white dark:text-black py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Join the Movement</h2>
          <p className="text-xl text-neutral-400 dark:text-neutral-600 mb-8">
            Are you a creator, artist, or cultural leader? We want to hear your story.
          </p>
          <Link 
            to="/ambassador-application"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white dark:bg-black text-black dark:text-white font-medium rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors group"
          >
            Apply to Become an Ambassador
            <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>
    </div>
  );
}
