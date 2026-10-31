import { NextResponse } from 'next/server';

export const revalidate = 60; // Cache on edge for 60 seconds

export interface MatchItem {
  id: string;
  league: "Ngoại Hạng Anh" | "Champions League" | "NBA" | "V-League";
  team1: string;
  team2: string;
  team1Logo?: string;
  team2Logo?: string;
  score1: number | null;
  score2: number | null;
  status: "LIVE" | "FT" | "UPCOMING";
  time: string;
}

const LEAGUES = [
  { name: "Ngoại Hạng Anh", url: 'https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard' },
  { name: "Champions League", url: 'https://site.api.espn.com/apis/site/v2/sports/soccer/uefa.champions/scoreboard' },
  { name: "NBA", url: 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard' }
] as const;

function processESPNEvent(event: any, leagueName: MatchItem['league']): MatchItem {
  const comp = event.competitions[0];
  const homeTeam = comp.competitors.find((c: any) => c.homeAway === 'home');
  const awayTeam = comp.competitors.find((c: any) => c.homeAway === 'away');

  let status: MatchItem['status'] = 'UPCOMING';
  let time = '';

  const state = event.status.type.state;
  if (state === 'in') {
    status = 'LIVE';
    time = event.status.displayClock || event.status.type.shortDetail || 'LIVE';
  } else if (state === 'post') {
    status = 'FT';
    time = 'FT';
  } else if (state === 'pre') {
    status = 'UPCOMING';
    try {
      const d = new Date(event.date);
      // Format as HH:mm in VN time (assuming UTC+7) - using basic formatting as locale varies on Edge
      time = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Ho_Chi_Minh' });
    } catch {
      time = 'Upcoming';
    }
  }

  return {
    id: event.id,
    league: leagueName,
    team1: homeTeam?.team?.shortDisplayName || homeTeam?.team?.name || 'Unknown',
    team2: awayTeam?.team?.shortDisplayName || awayTeam?.team?.name || 'Unknown',
    team1Logo: homeTeam?.team?.logo,
    team2Logo: awayTeam?.team?.logo,
    score1: homeTeam?.score ? parseInt(homeTeam.score, 10) : null,
    score2: awayTeam?.score ? parseInt(awayTeam.score, 10) : null,
    status,
    time
  };
}

export async function GET() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s timeout

  try {
    const fetchPromises = LEAGUES.map(async (league) => {
      try {
        const res = await fetch(league.url, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        
        return data.events.slice(0, 5).map((event: any) => processESPNEvent(event, league.name));
      } catch (e) {
        console.error(`Error fetching ${league.name}:`, e);
        return [];
      }
    });

    const results = await Promise.allSettled(fetchPromises);
    clearTimeout(timeoutId);

    let allMatches: MatchItem[] = [];
    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        allMatches = allMatches.concat(result.value);
      }
    });

    return NextResponse.json({ matches: allMatches }, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
      }
    });

  } catch (error) {
    clearTimeout(timeoutId);
    console.error("Match fetch failed entirely:", error);
    return NextResponse.json({ matches: [] }, { 
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
      }
    });
  }
}
