'use client';

import React from 'react';
import { ExternalLink, Radio } from 'lucide-react';

function TeamLine({ team }) {
  return (
    <div className="flex items-center gap-3 min-w-0">
      {team?.logo ? (
        <img src={team.logo} alt="" className="w-10 h-10 object-contain shrink-0" />
      ) : (
        <span className="w-10 h-10 rounded-full bg-white/10 shrink-0" />
      )}
      <span className="text-base sm:text-lg font-black text-white truncate">{team?.name || 'TBD'}</span>
      <span className="ml-auto text-3xl font-black tabular-nums text-white">{team?.score ?? ''}</span>
    </div>
  );
}

export default function EspnGamePanel({ event }) {
  if (!event) return null;
  const watch = event.officialWatch;
  const phase = event.isLive ? 'LIVE' : event.isFinal ? 'FINAL' : 'SCHEDULED';

  return (
    <div
      className="w-full rounded-xl border border-white/10 bg-gradient-to-br from-[#0e111a] to-[#05060a] p-4 sm:p-5 space-y-4"
      data-testid="espn-scoreboard-panel"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase tracking-widest text-[#E50914] flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5" /> ESPN Scoreboard · {event.league || event.category}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {phase}
            {event.status ? ` · ${event.status}` : ''}
            {event.broadcast ? ` · ${event.broadcast}` : ''}
          </p>
        </div>
        {watch?.url && (
          <a
            href={watch.url}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[44px] px-4 py-2 rounded-lg bg-[#E50914] hover:bg-[#f6121d] text-white text-xs font-extrabold flex items-center gap-2 transition"
          >
            Watch on {watch.label} <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      <div className="rounded-xl border border-white/10 bg-[#141416] p-4 space-y-3">
        <TeamLine team={event.awayTeam} />
        <TeamLine team={event.homeTeam} />
      </div>

      <p className="text-[11px] text-gray-500">
        Scores from ESPN. This game&apos;s video is licensed to the broadcaster, so Live Wire links out instead of embedding a stream.
      </p>
    </div>
  );
}
