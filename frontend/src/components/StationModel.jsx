function WinterLandscape({ bharati }) {
  return <>
    <defs>
      <linearGradient id="polar-sky" x2="0" y2="1"><stop stopColor="#9dc5dc" /><stop offset=".66" stopColor="#d8e8ed" /><stop offset="1" stopColor="#f2f7f7" /></linearGradient>
      <linearGradient id="snow-ground" x2="0" y2="1"><stop stopColor="#f4f9fa" /><stop offset="1" stopColor="#b9d2db" /></linearGradient>
      <linearGradient id="maitri-red" x2="0" y2="1"><stop stopColor="#e9f0ef" /><stop offset=".48" stopColor="#fff" /><stop offset=".49" stopColor="#c63f49" /><stop offset="1" stopColor="#9b2d39" /></linearGradient>
      <linearGradient id="bharati-shell" x2="0" y2="1"><stop stopColor="#4a5059" /><stop offset=".55" stopColor="#202630" /><stop offset="1" stopColor="#111820" /></linearGradient>
      <linearGradient id="window-glow" x2="0" y2="1"><stop stopColor="#d5f3f1" /><stop offset=".5" stopColor="#91c8d0" /><stop offset="1" stopColor="#385d6b" /></linearGradient>
      <linearGradient id="window-warm" x2="0" y2="1"><stop stopColor="#ffe3a1" /><stop offset="1" stopColor="#bf844c" /></linearGradient>
      <radialGradient id="dome" cx="35%" cy="28%"><stop stopColor="#fff" /><stop offset=".64" stopColor="#f1f6f7" /><stop offset="1" stopColor="#aec7cf" /></radialGradient>
      <filter id="model-shadow" x="-.3" y="-.3" width="1.6" height="1.8"><feGaussianBlur stdDeviation="9" /></filter>
    </defs>
    <rect width="1000" height="560" fill="url(#polar-sky)" />
    <circle cx="808" cy="77" r="35" fill="#fff" opacity=".14" />
    <path d="M0 239 74 155 125 193 224 96 287 171 373 90 442 173 538 104 626 183 739 98 813 167 910 98 1000 181V318H0Z" fill="#f1f7f8" />
    <path d="m0 239 74-84 25 22 35-26 27 38 63-93 29 45 35-11 24 38 61-78 45 49 34-12 30 46 55-76 48 50 35-12 33 44 63-85 37 39 48-5 34 45 56-70 74 67v103H0Z" fill="#a9c3ce" opacity=".65" />
    <path d="M0 275q122-50 254-7t274 1q161-58 472 12v279H0Z" fill="url(#snow-ground)" />
    <path d="M0 398q163-66 314-9t285 5q202-77 401-1v167H0Z" fill="#e7f0f1" opacity=".84" />
    <path d="M0 473q159-50 312-7t294 1q214-54 394-3v96H0Z" fill="#d3e4e8" opacity=".74" />
    <ellipse cx="535" cy="418" rx="355" ry="34" fill="#718d9b" opacity=".23" filter="url(#model-shadow)" />
    {Array.from({ length: 28 }, (_, i) => <circle key={i} cx={(i * 173 + 23) % 1000} cy={(i * 71 + 19) % 540} r={i % 4 === 0 ? 2 : 1.2} fill="#fff" opacity={i % 3 === 0 ? .75 : .42} />)}
    {!bharati && <g opacity=".9"><path d="M0 374h110v6H0Z" fill="#263c47" /><path d="M25 380v62m38-62v62m38-62v62" stroke="#364c55" strokeWidth="4" /><path d="m9 367 89-30 27 8-90 30Z" fill="#405a65" /><ellipse cx="127" cy="331" rx="20" ry="17" fill="url(#dome)" /><path d="M107 331q20 21 40 0" fill="none" stroke="#93aeb7" strokeWidth="2" /></g>}
  </>;
}

function MaitriArchitecture() {
  return <g className="model-architecture maitri-architecture">
    <path d="M225 376 751 333l135 45-530 61Z" fill="#506873" opacity=".48" />
    {/* Elevated steel stilts and cross bracing */}
    {[292, 354, 421, 488, 555, 622, 689, 756].map((x) => <g key={x} stroke="#344d59" strokeWidth="7" fill="none"><path d={`M${x} 300v112`} /><path d={`M${x + 29} 299v111`} /><path d={`m${x} 327 29 40m-29 0 29-40`} /></g>)}
    {/* Main connected modular buildings */}
    <path d="m227 237 402-33 117 34-398 42Z" fill="#f4f6f2" stroke="#c73843" strokeWidth="6" />
    <path d="m348 280 398-42 110 36-405 49Z" fill="url(#maitri-red)" stroke="#9e3038" strokeWidth="3" />
    <path d="m227 237 398-33v18l-398 35Z" fill="#c83d48" />
    <path d="m625 222 121 35v17l-121-34Z" fill="#8d2631" />
    <path d="m348 280 402-42v16l-402 45Z" fill="#d94750" />
    {/* Repeating pale roof modules and red end caps */}
    {[270, 326, 382, 438, 494, 550, 606, 662, 718].map((x) => <path key={x} d={`M${x} ${243 - (x - 270) * .082}l42 9v12l-42-9Z`} fill="#f7fbfa" stroke="#b9cbd0" strokeWidth="1" />)}
    {/* Long window bands */}
    <path d="m258 256 349-29 1 23-348 31Z" fill="url(#window-glow)" stroke="#455d68" strokeWidth="3" />
    <path d="m381 294 345-36 1 22-344 39Z" fill="url(#window-glow)" stroke="#455d68" strokeWidth="3" />
    {[292, 333, 374, 415, 456, 497, 538, 579, 620, 661, 702].map((x) => <path key={x} d={`M${x} ${253 - (x - 292) * .083}v20`} stroke="#d7e6e8" strokeWidth="3" />)}
    {[415, 456, 497, 538, 579, 620, 661, 702].map((x) => <path key={x} d={`M${x} ${291 - (x - 415) * .09}v22`} stroke="#e9f3f4" strokeWidth="3" />)}
    {/* Red cross-bridges and snow covered roof pods */}
    <path d="m337 222 76-6 28 13-76 8Z" fill="#fbffff" stroke="#c83d48" strokeWidth="5" />
    <path d="m540 203 60-5 28 11-60 7Z" fill="#f5f9f8" stroke="#c83d48" strokeWidth="4" />
    <path d="m788 290 111 25 36 22-109-29Z" fill="#435d67" />
    <path d="m814 306 98 27v8l-98-26Z" fill="#dce8e9" />
    {/* Snow bridge */}
    <path d="m189 324 172-27 15 10-174 30Z" fill="#e5eff0" stroke="#435c66" strokeWidth="3" />
    <path d="m213 336 4 48m38-54 4 48m38-54 4 48" stroke="#445b64" strokeWidth="4" />
    {/* Indian flag */}
    <path d="M168 286v91" stroke="#536973" strokeWidth="3" /><path d="M170 288h40v8h-40Z" fill="#f28c3c" /><path d="M170 296h40v8h-40Z" fill="#fff" /><path d="M170 304h40v8h-40Z" fill="#16854a" /><circle cx="190" cy="300" r="2" fill="#294da5" />
  </g>;
}

function BharatiArchitecture() {
  return <g className="model-architecture bharati-architecture">
    {/* Long dark station elevated above snow on splayed steel legs */}
    <path d="m232 380 497-54 179 45-513 76Z" fill="#506873" opacity=".47" />
    {[306, 385, 470, 557, 644, 730, 812].map((x) => <g key={x} stroke="#37434b" strokeWidth="9" fill="none"><path d={`M${x} 290v127`} /><path d={`m${x} 327-21 89m21-89 24 88`} /></g>)}
    <path d="m236 236 575-62 104 24-568 73Z" fill="#141b23" stroke="#68737b" strokeWidth="4" />
    <path d="m347 271 483-52 97 25-482 63Z" fill="url(#bharati-shell)" stroke="#222a31" strokeWidth="4" />
    {/* Sloping side wings and broad dark undercroft */}
    <path d="m236 236 111 35-10 69-115-48Z" fill="#202832" />
    <path d="m811 198 104 0-12 98-99-27Z" fill="#151b23" />
    <path d="m340 340 11-68 488-53-10 79Z" fill="#11171e" opacity=".92" />
    {/* Continuous glazed upper band */}
    <path d="m265 231 529-58-1 52-527 58Z" fill="#242d37" stroke="#65737c" strokeWidth="3" />
    <path d="m281 234 491-54v38l-491 53Z" fill="url(#window-warm)" opacity=".9" />
    {[324, 376, 428, 480, 532, 584, 636, 688, 740].map((x) => <path key={x} d={`M${x} ${230 - (x - 324) * .102}v43`} stroke="#222a31" strokeWidth="6" />)}
    <path d="m385 280 391-42-1 24-390 45Z" fill="url(#window-glow)" opacity=".8" />
    {[430, 482, 534, 586, 638, 690, 742].map((x) => <path key={x} d={`M${x} ${277 - (x - 430) * .105}v23`} stroke="#4c5a62" strokeWidth="5" />)}
    {/* Rooftop service blocks */}
    <path d="m571 167 68-7 10 11-68 8Z" fill="#4c5860" /><path d="m658 158 43-5 9 9-43 6Z" fill="#303a43" />
    {/* Radome next to the station */}
    <path d="M818 256v27m-27 0h53" stroke="#4e626c" strokeWidth="4" />
    <circle cx="818" cy="230" r="34" fill="url(#dome)" stroke="#a5bbc3" strokeWidth="2" />
    <path d="M785 235q33 31 66 0" fill="none" stroke="#a5bbc3" strokeWidth="2" />
    {/* Satellite dish and access bridge */}
    <path d="m128 337 165-18 15 10-170 25Z" fill="#435b65" /><path d="m158 350 4 42m36-47 4 42m36-47 4 42" stroke="#40555f" strokeWidth="4" />
    <ellipse cx="902" cy="315" rx="22" ry="17" fill="url(#dome)" /><path d="M902 331v34m-18 0h36" stroke="#596f78" strokeWidth="3" />
  </g>;
}

export default function StationModel({ station, parts, activePart, units, onSelect }) {
  const isBharati = station.code.toLowerCase() === 'bharati';
  return <div className={`isometric-scene station-scene station-${station.code.toLowerCase()}`}>
    <svg className="station-model" viewBox="0 0 1000 560" role="img" aria-label={`${station.name} Antarctic station digital twin`}>
      <WinterLandscape bharati={isBharati} />
      {isBharati ? <BharatiArchitecture /> : <MaitriArchitecture />}
      <g className="station-hotspots">
        {parts.map((part) => {
          const [x, y] = isBharati ? part.bharatiPoint : part.point;
          const critical = units.some((unit) => unit.type === part.infra && unit.status === 'Critical');
          const active = activePart?.id === part.id;
          return <g
            key={part.id}
            className={`model-hotspot${active ? ' active' : ''}${critical ? ' critical' : ''}`}
            transform={`translate(${x} ${y})`}
            role="button"
            tabIndex="0"
            aria-label={`Inspect ${part.label}${critical ? ', critical' : ''}`}
            onMouseEnter={() => onSelect(part)}
            onFocus={() => onSelect(part)}
            onClick={() => onSelect(part)}
            onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onSelect(part); } }}
          >
            <title>{part.label}{critical ? ' · Critical condition' : ''}</title>
            <circle className="hotspot-ring" r="19" />
            <circle className="hotspot-core" r="7" />
            {critical && <text className="hotspot-critical" x="0" y="4">!</text>}
            <rect className="hotspot-tag" x="-57" y="24" width="114" height="22" rx="4" />
            <text className="hotspot-name" x="0" y="39" textAnchor="middle">{part.label}</text>
          </g>;
        })}
      </g>
      <g className="model-overlay"><rect x="18" y="18" width="224" height="29" rx="4" /><text x="31" y="37">{station.code} / ANTARCTIC FIELD MODEL</text><circle cx="966" cy="32" r="5" /></g>
      <g className="model-compass"><circle cx="950" cy="510" r="23" /><path d="m950 490 6 21-6-4-6 4Z" /><text x="950" y="544" textAnchor="middle">N</text></g>
    </svg>
    <div className="scene-caption">ILLUSTRATIVE STATION MODEL · LIVE SENSOR OVERLAY</div>
  </div>;
}
