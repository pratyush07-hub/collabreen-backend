const { spawn } = require("child_process");

// function GenerateInstaInsights(instaHandle) {

//     return new Promise((resolve, reject) => {
//         // Spawn the Python process with the Insta handle
//         const data = spawn("python", ["C:/StartingCore/collab-reen/collab-reen-backend-master/utils/insights.py", instaHandle]);

//         let output = '';

//         // Capture all data from stdout
//         data.stdout.on("data", (chunk) => {
//             output += chunk.toString();  // Accumulate the output
//         });

//         // Handle errors
//         data.stderr.on("data", (error) => {
//             reject(`Error: ${error.toString()}`);
//         });

//         // After process completion, filter and parse the output
//         data.on("close", (code) => {
//             console.log(`Python script exited with code ${code}`);
//             console.log(output)

//             // Use a regular expression to extract JSON data from the output
//             const jsonMatch = output.match(/{.*}/s);  // This regex looks for a JSON block in the output

//             if (jsonMatch) {
//                 try {
//                     const insights = JSON.parse(jsonMatch[0]);
//                     resolve(insights); // Return the parsed insights
//                 } catch (err) {
//                     reject(`Error parsing JSON: ${err}`);
//                 }
//             } else {
//                 reject("No JSON output found.");
//             }
//         });
//     });
// }

// module.exports = GenerateInstaInsights


// const { spawn } = require("child_process");

// function GenerateInstaInsights(instaHandle) {
//     // Spawn the Python process with the Insta handle
//     const data = spawn("python", ["C:/Users/jaych/Desktop/Starting Core/collab-reen-backend/utils/insights.py", instaHandle]);

//     // Capture and log all data from stdout
//     data.stdout.on("data", (chunk) => {
//         console.log(chunk.toString());  // Log the output as it is received
//     });

//     // Log any errors that occur
//     data.stderr.on("data", (error) => {
//         console.error(`Error: ${error.toString()}`);
//     });

//     // Log when the process exits
//     data.on("close", (code) => {
//         console.log(`Python script exited with code ${code}`);
//     });
// }

// module.exports = GenerateInstaInsights;


// function GenerateInstaInsights(instaHandle) {
//     return new Promise((resolve, reject) => {
//         console.log(`Starting analysis for: ${instaHandle}`);

//         // Add timeout to prevent hanging
//         const timeout = setTimeout(() => {
//             data.kill();
//             reject(new Error("Python script timeout - Instagram may be rate limiting"));
//         }, 300000); // 5 minute timeout

//         // Spawn the Python process with the Insta handle
//         const data = spawn("python", ["C:/StartingCore/collab-reen/collab-reen-backend-master/utils/insights.py", instaHandle]);

//         let output = '';
//         let errorOutput = '';

//         // Capture all data from stdout
//         data.stdout.on("data", (chunk) => {
//             output += chunk.toString();
//             console.log("Python stdout:", chunk.toString());
//         });

//         // Handle errors from stderr
//         data.stderr.on("data", (error) => {
//             errorOutput += error.toString();
//             console.error("Python stderr:", error.toString());
//         });

//         // After process completion, filter and parse the output
//         data.on("close", (code) => {
//             clearTimeout(timeout);
//             console.log(`Python script exited with code ${code}`);

//             if (code !== 0) {
//                 return reject(new Error(`Python script failed with exit code ${code}. Error: ${errorOutput}`));
//             }

//             // Check for specific Instagram errors in the output
//             if (output.includes("401 Unauthorized") || output.includes("Please wait a few minutes")) {
//                 return reject(new Error("Instagram rate limiting detected. Please wait before trying again."));
//             }

//             if (output.includes("Failed to process")) {
//                 return reject(new Error("Failed to process Instagram profile. Account may be private or rate limited."));
//             }

//             // Use a more robust regex to extract JSON data
//             const jsonMatch = output.match(/\{[\s\S]*"method2"[\s\S]*?\}/);

//             if (jsonMatch) {
//                 try {
//                     const insights = JSON.parse(jsonMatch[0]);
//                     console.log("Successfully parsed insights:", insights);
//                     resolve(insights);
//                 } catch (err) {
//                     console.error("JSON parsing error:", err);
//                     reject(new Error(`Error parsing JSON: ${err.message}`));
//                 }
//             } else {
//                 console.log("Full output:", output);
//                 reject(new Error("No valid JSON output found in Python script response."));
//             }
//         });

//         // Handle process errors
//         data.on('error', (err) => {
//             clearTimeout(timeout);
//             reject(new Error(`Failed to start Python process: ${err.message}`));
//         });
//     });
// // }

// part 2
// function GenerateInstaInsights(instaHandle) {
//     return new Promise((resolve, reject) => {
//         console.log(`Starting analysis for: ${instaHandle}`);

//         // Add timeout to prevent hanging
//         const timeout = setTimeout(() => {
//             data.kill();
//             reject(new Error("Python script timeout - Instagram may be rate limiting"));
//         }, 300000); // 5 minute timeout

//         // Spawn the Python process with the Insta handle
//         const data = spawn("python", ["C:/Users/choud/OneDrive/Desktop/startingCore/collab-reen/collab-reen-backend-master/utils/insights.py", instaHandle]);

//         let output = '';
//         let errorOutput = '';

//         // Capture all data from stdout
//         data.stdout.on("data", (chunk) => {
//             output += chunk.toString();
//             console.log("Python stdout:", chunk.toString());
//         });

//         // Handle errors from stderr
//         data.stderr.on("data", (error) => {
//             errorOutput += error.toString();
//             console.error("Python stderr:", error.toString());
//         });

//         // After process completion, filter and parse the output
//         data.on("close", (code) => {
//             clearTimeout(timeout);
//             console.log(`Python script exited with code ${code}`);

//             if (code !== 0) {
//                 return reject(new Error(`Python script failed with exit code ${code}. Error: ${errorOutput}`));
//             }

//             // First try to extract JSON data before checking for errors
//             const jsonMatch = output.match(/\{[\s\S]*"method2"[\s\S]*?\}/);

//             if (jsonMatch) {
//                 try {
//                     const insights = JSON.parse(jsonMatch[0]);
//                     console.log("Successfully parsed insights:", insights);

//                     // Check if the insights contain valid data (not just error response)
//                     if (insights.followers > 0 || insights.posts > 0) {
//                         resolve(insights);
//                         return;
//                     }
//                 } catch (err) {
//                     console.error("JSON parsing error:", err);
//                 }
//             }

//             // Check for specific Instagram errors only if we couldn't get valid data
//             if (output.includes("401 Unauthorized") || output.includes("Please wait a few minutes")) {
//                 return reject(new Error("Instagram rate limiting detected. Please wait before trying again."));
//             }

//             if (output.includes("Failed to process")) {
//                 return reject(new Error("Failed to process Instagram profile. Account may be private or rate limited."));
//             }

//             // If we have JSON but it's invalid data, still try to use it
//             if (jsonMatch) {
//                 try {
//                     const insights = JSON.parse(jsonMatch[0]);
//                     console.log("Using partial insights data:", insights);
//                     resolve(insights);
//                 } catch (err) {
//                     reject(new Error(`Error parsing JSON: ${err.message}`));
//                 }
//             } else {
//                 console.log("Full output:", output);
//                 reject(new Error("No valid JSON output found in Python script response."));
//             }
//         });

//         // Handle process errors
//         data.on('error', (err) => {
//             clearTimeout(timeout);
//             reject(new Error(`Failed to start Python process: ${err.message}`));
//         });
//     });
// }

// module.exports = GenerateInstaInsights;



const Instagram = require('instagram-web-api');
const dotenv = require('dotenv');
dotenv.config();

// === Predefined themes ===
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
  const lower = text.toLowerCase();
  const scores = {};

  for (const [theme, keywords] of Object.entries(THEME_KEYWORDS)) {
    let score = 0;
    for (const word of keywords) {
      score += (lower.match(new RegExp(word, 'g')) || []).length;
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
    ratio_ok: ratio > 0.5,
    engagement_ok: engagementRate >= 0.5 && engagementRate <= 12,
    not_following_too_many: following < followers * 2,
  };
  const score = Object.values(factors).filter(Boolean).length;
  return score >= 2 ? 'real' : 'fake';
}

function randomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

// === Main Function ===
async function GenerateInstaInsights(instaHandle) {
  console.log(`Starting analysis for: ${instaHandle}`);

  const client = new Instagram({
    username: process.env.INSTAGRAM_USERNAME,
    password: process.env.INSTAGRAM_PASSWORD,
  });

  try {
    await client.login();
    console.log('Logged into Instagram successfully!');
  } catch (err) {
    console.error('Login failed:', err.message);
    return {
      error: 'Instagram login failed',
      username: instaHandle,
      followers: 0,
      following: 0,
      posts: 0,
      engagementRate: 0,
      accountType: 'fake',
      method1: 'Unknown',
      method2: 'Unknown',
    };
  }

  try {
    const profile = await client.getUserByUsername({ username: instaHandle });
    if (!profile) throw new Error('Profile not found or private');

    const followers = profile.edge_followed_by?.count || 0;
    const following = profile.edge_follow?.count || 0;
    const posts = profile.edge_owner_to_timeline_media?.count || 0;
    const bio = `${profile.biography || ''} ${profile.full_name || ''} ${profile.external_url || ''}`;

    const engagementRate = estimateEngagementRate(followers);
    const authenticity = determineAuthenticity(followers, following, engagementRate);
    const theme = classifyContentSimple(bio);

    const insights = {
      username: instaHandle,
      followers,
      following,
      posts,
      engagementRate: parseFloat(engagementRate.toFixed(2)),
      accountType: authenticity,
      method1: theme,
      method2: theme,
    };

    console.log('Generated insights:', insights);
    return insights;
  } catch (err) {
    console.error('Error analyzing profile:', err.message);
    return {
      error: 'Profile not found or private',
      username: instaHandle,
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

module.exports = GenerateInstaInsights;
