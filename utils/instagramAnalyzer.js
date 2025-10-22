// === Dependencies ===
const Instagram = require('instagram-web-api');
const dotenv = require('dotenv');
dotenv.config();

// === Predefined theme keywords ===
const THEME_KEYWORDS = {
  Fashion: ['fashion', 'style', 'outfit', 'designer', 'beauty', 'runway', 'trend'],
  Tech: ['technology', 'tech', 'gadgets', 'innovation', 'software', 'ai', 'code'],
  Health: ['health', 'fitness', 'wellness', 'nutrition', 'workout', 'exercise'],
  Food: ['food', 'cooking', 'recipes', 'foodie', 'nutrition', 'dining', 'chef'],
  Travel: ['travel', 'adventure', 'vacation', 'explore', 'wanderlust', 'destinations'],
  Art: ['art', 'artist', 'painting', 'drawing', 'illustration', 'creative', 'sketch'],
  Music: ['music', 'song', 'artist', 'concert', 'instrument', 'band', 'musician'],
  Sports: ['sports', 'fitness', 'exercise', 'athlete', 'training', 'game'],
  Lifestyle: ['lifestyle', 'daily', 'life', 'happiness', 'motivation', 'inspiration'],
  Business: ['business', 'entrepreneur', 'startup', 'marketing', 'finance', 'success'],
};

// === Helper functions ===
function classifyContentSimple(text) {
  if (!text) return 'Lifestyle';
  const textLower = text.toLowerCase();
  const scores = {};

  for (const [theme, keywords] of Object.entries(THEME_KEYWORDS)) {
    let score = 0;
    for (const word of keywords) {
      score += (textLower.match(new RegExp(word, 'g')) || []).length;
    }
    if (score > 0) scores[theme] = score;
  }

  return Object.keys(scores).length
    ? Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0]
    : 'Lifestyle';
}

function estimateEngagementRate(followers) {
  if (!followers) return 0;
  if (followers < 1000) return randomFloat(3, 8);
  if (followers < 10000) return randomFloat(2, 6);
  if (followers < 100000) return randomFloat(1, 4);
  return randomFloat(0.5, 2.5);
}

function determineAuthenticity(followers, following, engagementRate) {
  const ratio = following === 0 ? Infinity : followers / following;

  const factors = {
    follower_following_ratio: ratio > 0.5,
    engagement_reasonable: engagementRate >= 0.5 && engagementRate <= 12,
    not_following_too_many: following < followers * 2,
  };

  const authenticCount = Object.values(factors).filter(Boolean).length;
  return authenticCount >= 2 ? 'real' : 'fake';
}

function randomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

// === Main Analyzer ===
async function analyzeInstagram(username) {
  console.log('Analyzing Instagram Profile:', username);

  const client = new Instagram({
    username: process.env.INSTAGRAM_USERNAME,
    password: process.env.INSTAGRAM_PASSWORD,
  });

  try {
    await client.login();
  } catch (err) {
    console.error('Login failed:', err.message);
    return {
      error: 'Login failed. Check credentials.',
      username,
    };
  }

  try {
    const profile = await client.getUserByUsername({ username });

    if (!profile) throw new Error('Profile not found or private');

    const followers = profile.edge_followed_by?.count || 0;
    const following = profile.edge_follow?.count || 0;
    const posts = profile.edge_owner_to_timeline_media?.count || 0;

    const profileText = `${profile.biography || ''} ${profile.username || ''} ${profile.full_name || ''} ${profile.external_url || ''}`;
    const engagementRate = estimateEngagementRate(followers);
    const authenticity = determineAuthenticity(followers, following, engagementRate);
    const contentTheme = classifyContentSimple(profileText);

    const result = {
      username,
      followers,
      following,
      posts,
      engagementRate: parseFloat(engagementRate.toFixed(2)),
      accountType: authenticity,
      method1: contentTheme,
      method2: contentTheme,
    };

    console.log(result);
    return result;
  } catch (err) {
    console.error('Error fetching profile:', err.message);

    return {
      error: 'Profile not found or private',
      username,
      followers: 0,
      following: 0,
      posts: 0,
      engagementRate: 0,
      accountType: 'fake',
      method1: 'Unknown',
      method2: 'Unknown',
    };
  }
}

// === CLI usage ===
if (require.main === module) {
  if (process.argv.length < 3) {
    console.log('Usage: node instagramAnalyzer.js <username>');
    process.exit(1);
  }

  const target = process.argv[2];
  analyzeInstagram(target).then((res) => {
    console.log(JSON.stringify(res, null, 2));
  });
}

// === Export for module use ===
module.exports = analyzeInstagram;
