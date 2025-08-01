import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { user1, user2 } = await request.json();

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `You are a savage roast master analyzing GitHub profiles. Based on the data below, create a BRUTAL and SAVAGE roast for each user (2-3 lines each), and declare a winner based on their GitHub statistics. Don't hold back - make it spicy! 🔥

USER 1: ${user1.user.login}
- Repos: ${user1.user.public_repos}
- Followers: ${user1.user.followers}
- Following: ${user1.user.following}
- Total Stars: ${user1.stats.totalStars}
- Total Forks: ${user1.stats.totalForks}
- Top Languages: ${Object.keys(user1.stats.languages).slice(0, 3).join(', ')}
- Top Repo: ${user1.stats.topRepos[0]?.name} (${user1.stats.topRepos[0]?.stars} stars)
- Account Age: ${new Date(user1.user.created_at).getFullYear()}
- Bio: ${user1.user.bio || 'No bio'}

USER 2: ${user2.user.login}
- Repos: ${user2.user.public_repos}
- Followers: ${user2.user.followers}
- Following: ${user2.user.following}
- Total Stars: ${user2.stats.totalStars}
- Total Forks: ${user2.stats.totalForks}
- Top Languages: ${Object.keys(user2.stats.languages).slice(0, 3).join(', ')}
- Top Repo: ${user2.stats.topRepos[0]?.name} (${user2.stats.topRepos[0]?.stars} stars)
- Account Age: ${new Date(user2.user.created_at).getFullYear()}
- Bio: ${user2.user.bio || 'No bio'}

Format your response as:
🔥 **${user1.user.login}**: [2-3 line savage roast]

🔥 **${user2.user.login}**: [2-3 line savage roast]

🏆 **WINNER**: [Winner's username] - [1 line brutal reason why they dominated]

Be absolutely RUTHLESS and SAVAGE. Roast their commit frequency, repo quality, follower-to-following ratio, language choices, bio, everything! Make it hurt but funny. No mercy!`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const roast = response.text();

    return NextResponse.json({ roast });
  } catch (error) {
    console.error('Error generating roast:', error);
    return NextResponse.json({ error: 'Failed to generate roast' }, { status: 500 });
  }
}
