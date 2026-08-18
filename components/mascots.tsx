import { useId, type CSSProperties } from "react";

type MascotProps = {
  size?: number;
  className?: string;
};

export function CapybaraMascot({ size = 140, className }: MascotProps) {
  const uid = useId().replace(/:/g, "");
  const body = `${uid}-capy-body`;
  const muzzle = `${uid}-capy-muzzle`;
  const belly = `${uid}-capy-belly`;
  const leaf = `${uid}-capy-leaf`;
  const scarf = `${uid}-capy-scarf`;
  const satchel = `${uid}-capy-satchel`;
  const halo = `${uid}-capy-halo`;
  const shadow = `${uid}-capy-shadow`;
  const style = { "--mascot-size": `${size}px` } as CSSProperties;

  return (
    <svg aria-label="Mascotte capybara" className={className} role="img" style={style} viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={body} x1=".15" x2=".88" y1=".05" y2=".95">
          <stop stopColor="#E0A25A" />
          <stop offset=".48" stopColor="#B9713D" />
          <stop offset="1" stopColor="#74402D" />
        </linearGradient>
        <linearGradient id={muzzle} x1=".15" x2=".8" y1="0" y2="1">
          <stop stopColor="#8B5136" />
          <stop offset="1" stopColor="#573426" />
        </linearGradient>
        <linearGradient id={belly} x1=".18" x2=".8" y1="0" y2="1">
          <stop stopColor="#F0BC7D" />
          <stop offset="1" stopColor="#B96E3D" />
        </linearGradient>
        <linearGradient id={leaf} x1="0" x2="1" y1="1" y2="0">
          <stop stopColor="#4A753E" />
          <stop offset="1" stopColor="#BDD76D" />
        </linearGradient>
        <linearGradient id={scarf} x1="0" x2="1" y1="0" y2="1">
          <stop stopColor="#7DA455" />
          <stop offset="1" stopColor="#416C42" />
        </linearGradient>
        <linearGradient id={satchel} x1="0" x2="1" y1="0" y2="1">
          <stop stopColor="#D49B50" />
          <stop offset="1" stopColor="#8A552F" />
        </linearGradient>
        <radialGradient id={halo}>
          <stop stopColor="#FFE39A" stopOpacity=".52" />
          <stop offset="1" stopColor="#FFE39A" stopOpacity="0" />
        </radialGradient>
        <filter id={shadow} x="-35%" y="-35%" width="170%" height="180%">
          <feDropShadow dx="0" dy="5" floodColor="#4B311F" floodOpacity=".28" stdDeviation="4" />
        </filter>
      </defs>

      <ellipse cx="80" cy="143" fill="#4E3524" opacity=".24" rx="48" ry="8" />
      <ellipse cx="83" cy="102" fill={`url(#${halo})`} rx="70" ry="62" />

      <g filter={`url(#${shadow})`} transform="rotate(-2 80 84)">
        <ellipse cx="51" cy="132" fill="#75442F" rx="15" ry="8" />
        <ellipse cx="106" cy="132" fill="#75442F" rx="15" ry="8" />
        <path d="M38 85c0-26 18-45 43-45 27 0 45 20 45 47v24c0 18-18 27-46 27s-42-10-42-27z" fill={`url(#${body})`} stroke="#68402E" strokeWidth="3" />
        <ellipse cx="80" cy="111" fill={`url(#${belly})`} opacity=".76" rx="28" ry="31" />
        <path d="M48 84c10 4 53 4 66-1l-4 15c-15 5-42 5-58 0z" fill={`url(#${scarf})`} stroke="#3D623B" strokeWidth="2" />
        <path d="M58 89c12 3 31 3 44 0" fill="none" opacity=".62" stroke="#C6DE81" strokeLinecap="round" strokeWidth="2" />
        <path d="M105 96c-1 15-1 26 4 37l12-6-3-24z" fill="#527A43" stroke="#3D623B" strokeWidth="2" />

        <path d="M46 100c-12-1-20 5-20 14 0 8 8 12 16 8 6-3 9-9 12-17" fill="#A8663A" stroke="#68402E" strokeWidth="3" />
        <path d="M112 97c8-8 16-13 22-8 7 5 3 15-4 19-6 3-12 0-16-4" fill="#B8723E" stroke="#68402E" strokeWidth="3" />
        <path d="M128 89c4-4 6-8 5-13" fill="none" stroke="#68402E" strokeLinecap="round" strokeWidth="3" />
        <path d="M132 75c7-7 14-4 16 3-7-1-11 2-14 7z" fill={`url(#${leaf})`} stroke="#4D7138" strokeWidth="1.5" />

        <path d="M42 62c-8-8-6-20 2-26 9-6 19 1 22 11M119 62c8-9 6-20-2-26-9-6-19 1-22 11" fill="#AA6B3B" stroke="#68402E" strokeWidth="3" />
        <path d="M48 47c4-5 9-6 14-2M112 47c-4-5-9-6-14-2" fill="none" opacity=".55" stroke="#F4C17D" strokeLinecap="round" strokeWidth="2" />
        <path d="M46 57c1-20 17-34 34-34 19 0 34 14 35 34 1 18-8 31-35 31S45 75 46 57Z" fill={`url(#${body})`} stroke="#68402E" strokeWidth="3" />
        <path d="M57 44c9-7 20-10 32-8" fill="none" opacity=".33" stroke="#FFD08A" strokeLinecap="round" strokeWidth="4" />

        <path d="M58 50c4-3 8-3 12-1M90 48c4-2 8-1 12 2" fill="none" stroke="#65402E" strokeLinecap="round" strokeWidth="2" />
        <ellipse cx="64" cy="57" fill="#35251E" rx="4.5" ry="5.8" />
        <ellipse cx="96" cy="56" fill="#35251E" rx="4.5" ry="5.8" />
        <circle cx="65.5" cy="54.5" fill="#FFF9E8" r="1.6" />
        <circle cx="97.5" cy="53.5" fill="#FFF9E8" r="1.6" />
        <circle cx="56" cy="71" fill="#EF9E77" opacity=".24" r="5.5" />
        <circle cx="104" cy="70" fill="#EF9E77" opacity=".24" r="5.5" />
        <ellipse cx="80" cy="69" fill={`url(#${muzzle})`} rx="17" ry="12" />
        <ellipse cx="80" cy="65" fill="#2D211C" rx="7.5" ry="5" />
        <circle cx="77" cy="63.5" fill="#FFF7E7" opacity=".65" r="1.3" />
        <path d="M80 70v4M70 75c5 6 15 7 21 0" fill="none" stroke="#35241E" strokeLinecap="round" strokeWidth="2.5" />
        <path d="M64 71c-5 1-9 3-12 6M97 70c5 1 9 3 12 6" fill="none" opacity=".45" stroke="#5E3B2C" strokeLinecap="round" strokeWidth="1.5" />

        <path d="M51 99c13 9 36 20 56 25" fill="none" stroke="#6F4A2E" strokeLinecap="round" strokeWidth="4" />
        <path d="M91 117h23v18H91z" fill={`url(#${satchel})`} stroke="#70472D" strokeWidth="2" />
        <path d="M96 116v-5h13v5M97 124h11" fill="none" stroke="#F0C16E" strokeLinecap="round" strokeWidth="2" />

        <path d="M107 25c8-10 18-9 22 0-8-2-14 1-18 8z" fill={`url(#${leaf})`} stroke="#4E7137" strokeWidth="2" />
        <path d="M122 21c4-11 15-13 21-5-9 0-13 5-15 12z" fill="#A8C45F" stroke="#4E7137" strokeWidth="2" />
        <path d="M111 27c5-3 9-5 14-5M127 22c4-3 8-4 12-5" fill="none" opacity=".66" stroke="#E1EC9A" strokeLinecap="round" strokeWidth="1.5" />
      </g>
    </svg>
  );
}

export function CatMascot({ size = 140, className }: MascotProps) {
  const style = { "--mascot-size": `${size}px` } as CSSProperties;

  return <svg aria-label="Mascotte chat" className={className} data-mascot="cat" role="img" style={style} viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg" />;
}

export function GhostMascot({ size = 140, className }: MascotProps) {
  const uid = useId().replace(/:/g, "");
  const body = `${uid}-ghost-body`;
  const underside = `${uid}-ghost-underside`;
  const glow = `${uid}-ghost-glow`;
  const lantern = `${uid}-ghost-lantern`;
  const bow = `${uid}-ghost-bow`;
  const shadow = `${uid}-ghost-shadow`;
  const style = { "--mascot-size": `${size}px` } as CSSProperties;

  return (
    <svg aria-label="Mascotte fantôme" className={className} role="img" style={style} viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={body} x1=".12" x2=".88" y1=".02" y2=".98">
          <stop stopColor="#FFFFFF" />
          <stop offset=".52" stopColor="#ECE6FA" />
          <stop offset="1" stopColor="#B7A0DA" />
        </linearGradient>
        <linearGradient id={underside} x1="0" x2="1" y1="0" y2="1">
          <stop stopColor="#D8C9EE" />
          <stop offset="1" stopColor="#8C75B6" />
        </linearGradient>
        <linearGradient id={lantern} x1="0" x2="0" y1="0" y2="1">
          <stop stopColor="#FFF0A8" />
          <stop offset=".48" stopColor="#F5BA5E" />
          <stop offset="1" stopColor="#C66D3D" />
        </linearGradient>
        <linearGradient id={bow} x1="0" x2="1" y1="0" y2="1">
          <stop stopColor="#9A76D4" />
          <stop offset="1" stopColor="#5C3A91" />
        </linearGradient>
        <radialGradient id={glow}>
          <stop stopColor="#E4C7FF" stopOpacity=".52" />
          <stop offset="1" stopColor="#8C61C7" stopOpacity="0" />
        </radialGradient>
        <filter id={shadow} x="-40%" y="-40%" width="190%" height="190%">
          <feDropShadow dx="0" dy="5" floodColor="#170E35" floodOpacity=".34" stdDeviation="4" />
        </filter>
      </defs>

      <ellipse cx="80" cy="143" fill="#160D33" opacity=".3" rx="43" ry="7" />
      <circle cx="82" cy="83" fill={`url(#${glow})`} r="74" />

      <g filter={`url(#${shadow})`} transform="rotate(2 80 83)">
        <path d="M41 125c-4-10 1-17 3-24V61c0-24 16-42 37-42s38 18 38 42v40c3 8 8 16 4 25-4 10-12 10-20 2-5 9-13 11-21 1-8 10-17 9-22-1-8 8-15 7-19-3Z" fill={`url(#${body})`} stroke="#8B73B8" strokeWidth="3" />
        <path d="M54 46c8-15 19-21 32-22" fill="none" opacity=".48" stroke="#FFFFFF" strokeLinecap="round" strokeWidth="4" />
        <path d="M46 105c2 16 5 23 13 28M115 103c-2 14-5 23-12 29" fill="none" opacity=".24" stroke="#7F68AB" strokeLinecap="round" strokeWidth="3" />
        <path d="M48 121c5 9 10 10 16 2 5 10 12 10 18 1 6 9 13 9 19 0 5 7 11 7 17 0" fill="none" opacity=".55" stroke={`url(#${underside})`} strokeLinecap="round" strokeWidth="3" />

        <path d="M44 85c-11-2-19 3-21 11-2 7 4 12 11 10 7-2 11-8 13-14" fill={`url(#${body})`} stroke="#8B73B8" strokeWidth="3" />
        <path d="M117 82c10-6 19-5 22 2 4 8-3 15-11 14-7 0-11-5-14-10" fill={`url(#${body})`} stroke="#8B73B8" strokeWidth="3" />

        <path d="M58 51c4-3 8-4 12-2M89 49c4-2 8-1 12 2" fill="none" stroke="#806DA3" strokeLinecap="round" strokeWidth="2" />
        <ellipse cx="65" cy="64" fill="#28213D" rx="5.5" ry="7.5" />
        <ellipse cx="95" cy="63" fill="#28213D" rx="5.5" ry="7.5" />
        <circle cx="67" cy="61" fill="#FFFFFF" r="2" />
        <circle cx="97" cy="60" fill="#FFFFFF" r="2" />
        <circle cx="56" cy="81" fill="#DBA5D0" opacity=".23" r="5" />
        <circle cx="104" cy="80" fill="#DBA5D0" opacity=".23" r="5" />
        <path d="M70 84c6 7 14 7 20 0" fill="none" stroke="#5C457A" strokeLinecap="round" strokeWidth="3" />
        <path d="M77 88c2 2 4 2 6 0" fill="none" opacity=".55" stroke="#E3A7C9" strokeLinecap="round" strokeWidth="2" />

        <path d="m80 94 7 8-7 7-7-7z" fill="#6D48A5" stroke="#493172" strokeWidth="2" />
        <path d="m80 94-9-7-6 8 11 7M80 94l9-7 6 8-11 7" fill={`url(#${bow})`} stroke="#493172" strokeLinejoin="round" strokeWidth="2" />
        <circle cx="80" cy="101" fill="#DAB7FF" r="2" />

        <circle cx="133" cy="117" fill="#FFD778" opacity=".19" r="29" />
        <path d="M122 102h22v30h-22z" fill="#5D3D8A" stroke="#332050" strokeWidth="2" />
        <path d="M119 102h28M125 102v-6a8 8 0 0 1 16 0v6" fill="none" stroke="#332050" strokeLinecap="round" strokeWidth="3" />
        <path d="M128 110h10v14h-10z" fill={`url(#${lantern})`} />
        <path d="M125 109h16M125 125h16M133 110v14" fill="none" opacity=".78" stroke="#FFE09A" strokeWidth="1.5" />
        <path d="M126 94c-4-4-6-8-7-13" fill="none" stroke="#7E64A9" strokeLinecap="round" strokeWidth="2" />

        <path d="M33 100c-7 8-7 15-1 20M129 47c8 2 12 7 11 14" fill="none" opacity=".44" stroke="#D9BDF5" strokeLinecap="round" strokeWidth="2" />
        <circle cx="139" cy="42" fill="#F7D48A" r="2" /><circle cx="31" cy="119" fill="#DCC4F4" r="1.7" />
      </g>
    </svg>
  );
}

export function SceneIllustration({ theme }: { theme: "gabriel" | "luca" }) {
  const uid = useId().replace(/:/g, "");
  const texture = `${uid}-scene-texture`;
  const shadow = `${uid}-scene-shadow`;

  if (theme === "luca") {
    const sky = `${uid}-night-sky`;
    const moon = `${uid}-moon`;
    const moonGlow = `${uid}-moon-glow`;
    const windows = `${uid}-window-glow`;
    const manor = `${uid}-manor`;
    const fog = `${uid}-fog`;

    return (
      <svg aria-hidden="true" className="scene-illustration" viewBox="0 0 600 350" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={sky} x1="0" x2="0" y1="0" y2="1">
            <stop stopColor="#090D25" />
            <stop offset=".45" stopColor="#21133F" />
            <stop offset="1" stopColor="#4C2A61" />
          </linearGradient>
          <radialGradient id={moonGlow}>
            <stop stopColor="#FFF4D3" stopOpacity=".96" />
            <stop offset=".36" stopColor="#D8C9F0" stopOpacity=".42" />
            <stop offset="1" stopColor="#B99EE4" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={moon} cx=".32" cy=".26" r=".78">
            <stop stopColor="#FFF8DF" />
            <stop offset=".65" stopColor="#D8CEEA" />
            <stop offset="1" stopColor="#9C91BC" />
          </radialGradient>
          <linearGradient id={windows} x1="0" x2="0" y1="0" y2="1">
            <stop stopColor="#FFF1A8" />
            <stop offset=".55" stopColor="#F5B75D" />
            <stop offset="1" stopColor="#C9683F" />
          </linearGradient>
          <linearGradient id={manor} x1="0" x2="1" y1="0" y2="1">
            <stop stopColor="#44305F" />
            <stop offset=".55" stopColor="#2A1B47" />
            <stop offset="1" stopColor="#15142F" />
          </linearGradient>
          <linearGradient id={fog} x1="0" x2="1" y1="0" y2="0">
            <stop stopColor="#9E8DBB" stopOpacity="0" />
            <stop offset=".5" stopColor="#C6BBDA" stopOpacity=".24" />
            <stop offset="1" stopColor="#9E8DBB" stopOpacity="0" />
          </linearGradient>
          <filter id={shadow} x="-20%" y="-20%" width="150%" height="160%">
            <feDropShadow dx="0" dy="7" floodColor="#070615" floodOpacity=".46" stdDeviation="5" />
          </filter>
          <filter id={texture} x="0" y="0" width="100%" height="100%">
            <feTurbulence baseFrequency=".75" numOctaves="2" seed="12" type="fractalNoise" />
            <feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 .08 0" />
          </filter>
        </defs>

        <rect fill={`url(#${sky})`} height="350" width="600" />
        <circle cx="474" cy="64" fill={`url(#${moonGlow})`} r="105" />
        <circle cx="474" cy="64" fill={`url(#${moon})`} r="34" />
        <circle cx="463" cy="52" fill="#ACA1C9" opacity=".38" r="7" />
        <circle cx="486" cy="75" fill="#A89CC4" opacity=".34" r="5" />
        <path d="M482 42c8 3 12 9 13 18M454 76c5 4 11 5 16 4" fill="none" opacity=".28" stroke="#9388B1" strokeLinecap="round" strokeWidth="2" />

        <g fill="#FFF1BB">
          <circle cx="38" cy="48" opacity=".88" r="1.8" /><circle cx="79" cy="85" opacity=".7" r="1.3" /><circle cx="121" cy="44" opacity=".78" r="1.7" />
          <circle cx="169" cy="100" opacity=".58" r="1.2" /><circle cx="226" cy="59" opacity=".8" r="1.6" /><circle cx="285" cy="107" opacity=".64" r="1.2" />
          <circle cx="349" cy="48" opacity=".68" r="1.4" /><circle cx="397" cy="91" opacity=".8" r="1.8" /><circle cx="548" cy="46" opacity=".78" r="1.7" />
          <circle cx="572" cy="111" opacity=".6" r="1.2" />
        </g>
        <path d="M91 54h12M97 48v12M319 73h9M323 69v9M545 98h12M551 92v12" opacity=".5" stroke="#E5D0F8" strokeLinecap="round" />
        <path d="M208 60l13 8 14-5 11 9" fill="none" opacity=".24" stroke="#D7C7ED" strokeLinecap="round" />

        <path d="M0 173c66-38 120-39 179-3 58-41 115-38 171-1 73-38 143-31 250 11v101H0z" fill="#30234D" opacity=".72" />
        <path d="M0 221c67-37 126-38 189-2 58-36 120-35 184 2 77-39 150-30 227 7v122H0z" fill="#16142D" opacity=".94" />
        <path d="M0 283c76-25 143-23 203 6 62-29 127-28 192 1 75-29 143-25 205-6v66H0z" fill="#090B1C" />

        <g filter={`url(#${shadow})`}>
          <g opacity=".76">
            <path d="M52 222h95v106H52z" fill="#17152E" stroke="#604A78" strokeWidth="2" />
            <path d="m40 224 59-46 60 46z" fill="#271B42" stroke="#73548D" strokeWidth="3" />
            <path d="M67 246h20v36H67zM110 246h20v36h-20zM86 296h28v32H86z" fill={`url(#${windows})`} opacity=".55" />
            <path d="M99 187v140" opacity=".36" stroke="#8C6BA5" strokeWidth="2" />
          </g>

          <path d="M205 191h263v159H205z" fill={`url(#${manor})`} stroke="#684784" strokeWidth="4" />
          <path d="m184 198 151-102 154 102z" fill="#35214F" stroke="#8457A2" strokeWidth="4" />
          <path d="M316 157h46v193h-46z" fill="#3D2856" stroke="#765090" strokeWidth="3" />
          <path d="M190 199h31v-67h38v67M453 199h31v-67h-38" fill="#291B45" stroke="#79509C" strokeWidth="3" />
          <path d="M221 132h38l-19-36zM446 132h38l-19-36z" fill="#30204C" stroke="#79509C" strokeWidth="3" />
          <path d="M326 157v-31h26v31M333 126c0-16 13-29 29-29s29 13 29 29" fill="#35224F" stroke="#8660A1" strokeWidth="3" />
          <path d="M344 116h37" opacity=".5" stroke="#B48DC1" strokeWidth="2" />

          <path d="M227 222h48v62h-48zM398 222h48v62h-48zM238 300h33v38h-33zM402 300h33v38h-33z" fill={`url(#${windows})`} opacity=".9" />
          <path d="M251 222v62M422 222v62M227 240h48M398 240h48M246 310h18M409 310h18" stroke="#7D526A" strokeWidth="3" />
          <path d="M315 229h48v83h-48z" fill="#17132D" stroke="#795390" strokeWidth="3" />
          <path d="M327 245h24v44h-24z" fill="#E6A653" opacity=".68" />
          <path d="M339 245v44M327 259h24M327 274h24" stroke="#9B6D63" strokeWidth="2" />

          <path d="M493 222h74v104h-74z" fill="#20183A" stroke="#674783" strokeWidth="3" />
          <path d="m484 224 47-37 47 37z" fill="#31204D" stroke="#79539A" strokeWidth="3" />
          <path d="M507 243h14v59h-14zM528 243h14v59h-14zM549 243h9v59h-9z" fill={`url(#${windows})`} opacity=".76" />
          <path d="M507 255h51M507 272h51M507 289h51" opacity=".48" stroke="#FFE19B" strokeWidth="2" />
        </g>

        <path d="M33 309c8-58 20-94 46-130M58 311c-2-49 5-81 26-111M570 309c-9-62-29-102-58-139M548 311c5-48-2-82-23-115" fill="none" opacity=".84" stroke="#17152F" strokeLinecap="round" strokeWidth="14" />
        <path d="M20 220c17-14 35-21 54-24M35 245c21-18 42-27 64-31M556 209c-18-15-36-22-56-26M581 239c-22-19-44-28-66-32" fill="none" opacity=".68" stroke="#28203E" strokeLinecap="round" strokeWidth="7" />

        <g>
          <circle cx="177" cy="283" fill="#FFCC72" opacity=".18" r="30" /><circle cx="505" cy="283" fill="#FFCC72" opacity=".18" r="30" />
          <path d="M168 275h18v27h-18zM496 275h18v27h-18z" fill="#4D3468" stroke="#9471AB" strokeWidth="2" />
          <path d="M172 281h10v14h-10zM500 281h10v14h-10z" fill={`url(#${windows})`} />
          <path d="M166 274h22M494 274h22" stroke="#D0ACD1" strokeLinecap="round" strokeWidth="2" />
        </g>

        <path d="M0 292c82-16 137-13 197 2 66-18 127-14 191 1 76-17 142-14 212 0" fill="none" stroke={`url(#${fog})`} strokeLinecap="round" strokeWidth="22" />
        <path d="M28 326c68-11 124-9 183 2M389 327c68-12 124-10 178 0" fill="none" opacity=".28" stroke="#BDA9D4" strokeLinecap="round" strokeWidth="4" />
        <path d="M441 350c18-35 44-54 80-57 34-3 58 15 79 43v14z" fill="#201633" opacity=".86" />
        <g fill="#55705E" opacity=".72">
          <ellipse cx="462" cy="327" rx="17" ry="8" transform="rotate(-24 462 327)" /><ellipse cx="488" cy="319" rx="15" ry="7" transform="rotate(22 488 319)" />
          <ellipse cx="536" cy="326" rx="17" ry="8" transform="rotate(-17 536 326)" /><ellipse cx="563" cy="317" rx="14" ry="7" transform="rotate(26 563 317)" />
        </g>
        <rect fill="#FFFFFF" filter={`url(#${texture})`} height="350" opacity=".48" width="600" />
      </svg>
    );
  }

  const sky = `${uid}-day-sky`;
  const sun = `${uid}-sun`;
  const river = `${uid}-river`;
  const path = `${uid}-path`;
  const foliage = `${uid}-foliage`;
  const cabin = `${uid}-cabin`;

  return (
    <svg aria-hidden="true" className="scene-illustration" viewBox="0 0 600 350" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={sky} x1="0" x2="0" y1="0" y2="1">
          <stop stopColor="#BFE7EA" />
          <stop offset=".46" stopColor="#E7EFC8" />
          <stop offset="1" stopColor="#F6D394" />
        </linearGradient>
        <radialGradient id={sun}>
          <stop stopColor="#FFF8C7" stopOpacity=".98" />
          <stop offset=".42" stopColor="#FFE394" stopOpacity=".42" />
          <stop offset="1" stopColor="#FFE394" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={river} x1="0" x2="1" y1="0" y2="1">
          <stop stopColor="#B1E4DC" />
          <stop offset=".48" stopColor="#69BBC1" />
          <stop offset="1" stopColor="#3B8798" />
        </linearGradient>
        <linearGradient id={path} x1="0" x2="1" y1="0" y2="1">
          <stop stopColor="#F5D9A2" />
          <stop offset="1" stopColor="#C48B54" />
        </linearGradient>
        <linearGradient id={foliage} x1="0" x2="1" y1="0" y2="1">
          <stop stopColor="#A8C867" />
          <stop offset=".5" stopColor="#6E9C50" />
          <stop offset="1" stopColor="#3F704B" />
        </linearGradient>
        <linearGradient id={cabin} x1="0" x2="1" y1="0" y2="1">
          <stop stopColor="#D99A55" />
          <stop offset="1" stopColor="#86512F" />
        </linearGradient>
        <filter id={shadow} x="-20%" y="-20%" width="150%" height="160%">
          <feDropShadow dx="0" dy="7" floodColor="#395B42" floodOpacity=".24" stdDeviation="5" />
        </filter>
        <filter id={texture} x="0" y="0" width="100%" height="100%">
          <feTurbulence baseFrequency=".8" numOctaves="2" seed="9" type="fractalNoise" />
          <feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 .07 0" />
        </filter>
      </defs>

      <rect fill={`url(#${sky})`} height="350" width="600" />
      <circle cx="477" cy="66" fill={`url(#${sun})`} r="96" />
      <circle cx="477" cy="66" fill="#FFF3B4" opacity=".9" r="26" />
      <g fill="#FFFFFF" opacity=".42">
        <ellipse cx="91" cy="57" rx="43" ry="11" /><ellipse cx="129" cy="52" rx="27" ry="15" />
        <ellipse cx="347" cy="92" rx="34" ry="9" /><ellipse cx="374" cy="87" rx="23" ry="13" />
      </g>
      <path d="M180 74c10-8 20-8 30 0M205 68c8-6 16-6 24 0" fill="none" opacity=".42" stroke="#6E8D76" strokeLinecap="round" strokeWidth="2" />

      <path d="M0 145c64-40 121-45 177-12 52-43 111-43 163-7 63-43 119-35 170 2 36-25 66-22 90-7v94H0z" fill="#B6C98C" opacity=".72" />
      <path d="M0 174c70-52 132-54 196-8 55-49 115-45 168-8 63-45 123-36 236 24v168H0z" fill="#94B66B" />
      <path d="M0 225c84-55 145-43 211-3 68-45 136-43 205-1 66-45 117-35 184 12v117H0z" fill="#5E9258" />

      <path d="M313 350c15-63 72-91 149-108 60-13 105-43 138-84v192z" fill={`url(#${river})`} />
      <path d="M0 350c79-70 150-81 223-57 49 16 84 7 113-28 28-35 47-53 91-70-49 54-59 91-40 155z" fill={`url(#${path})`} />
      <path d="M337 331c35-28 72-38 110-41 46-5 88-25 126-60M365 348c26-21 55-29 88-31" fill="none" opacity=".55" stroke="#D6F0E8" strokeLinecap="round" strokeWidth="3" />
      <path d="M435 274c30-7 59-22 86-45M487 248c18-7 35-17 50-30" fill="none" opacity=".32" stroke="#EDF9ED" strokeLinecap="round" strokeWidth="2" />

      <g filter={`url(#${shadow})`}>
        <path d="M169 193h94v68h-94z" fill={`url(#${cabin})`} stroke="#75482D" strokeWidth="3" />
        <path d="m153 196 63-49 64 49z" fill="#DDA15B" stroke="#75482D" strokeWidth="3" />
        <path d="M198 221h37v40h-37z" fill="#6F4730" />
        <path d="M181 209h17v21h-17zM238 209h17v21h-17z" fill="#BFD583" stroke="#70472F" strokeWidth="2" />
        <path d="M206 226h21v27h-21z" fill="#FFE69B" opacity=".82" />
        <path d="M181 219h17M238 219h17M216 226v27" opacity=".48" stroke="#FFF0B4" strokeWidth="2" />
        <path d="M170 261h93M177 266h79" stroke="#6A432C" strokeLinecap="round" strokeWidth="3" />
        <path d="M255 179h25v82h-25z" fill="#9A653A" stroke="#75482D" strokeWidth="3" />
        <path d="M252 177h31" stroke="#E2AB63" strokeLinecap="round" strokeWidth="4" />
      </g>

      <g filter={`url(#${shadow})`}>
        <path d="M273 244c30-9 61-8 91 2l-6 11c-27-7-53-7-80 0z" fill="#AD713F" stroke="#754A2F" strokeWidth="2" />
        <path d="M284 255v22M300 252v24M317 252v24M334 253v23M350 256v20" opacity=".74" stroke="#72472E" strokeWidth="2" />
        <path d="M269 245c34-18 70-17 100 1" fill="none" opacity=".58" stroke="#EDC47D" strokeLinecap="round" strokeWidth="3" />
      </g>

      <g fill={`url(#${foliage})`} filter={`url(#${shadow})`}>
        <circle cx="55" cy="145" r="49" /><circle cx="114" cy="125" r="43" /><circle cx="157" cy="151" r="35" />
        <circle cx="552" cy="157" r="57" /><circle cx="506" cy="124" r="40" /><circle cx="473" cy="165" r="29" />
      </g>
      <g fill="#79A451" opacity=".9">
        <circle cx="38" cy="178" r="30" /><circle cx="143" cy="174" r="34" /><circle cx="575" cy="190" r="33" /><circle cx="493" cy="183" r="26" />
      </g>
      <path d="M55 163v64M114 150v58M552 176v67M506 153v54" fill="none" opacity=".45" stroke="#4F7544" strokeLinecap="round" strokeWidth="8" />
      <path d="M50 169c15-8 30-9 45-4M514 164c16-7 31-6 45 2" fill="none" opacity=".36" stroke="#C8DF82" strokeLinecap="round" strokeWidth="3" />

      <g opacity=".92">
        <path d="M10 286c13-22 29-25 44-8-9 1-16 6-20 15-8-5-16-7-24-7zM106 310c14-21 29-23 44-5-9 0-16 5-21 13-8-5-15-7-23-8z" fill="#5D8B48" />
        <path d="M536 296c13-22 29-25 45-7-10 0-16 5-21 14-8-5-16-7-24-7z" fill="#557F47" />
        <path d="M41 324c3-10 8-17 14-23M49 325c-1-10 1-18 6-25M78 318c4-9 9-15 16-20M86 320c0-9 2-16 7-23" fill="none" stroke="#E8B85C" strokeLinecap="round" strokeWidth="2" />
        <circle cx="53" cy="304" fill="#F5CC72" r="4" /><circle cx="92" cy="300" fill="#F29C72" r="3.5" /><circle cx="518" cy="312" fill="#F5CA6A" r="4" />
        <ellipse cx="27" cy="312" fill="#B0A17E" rx="11" ry="6" /><ellipse cx="148" cy="331" fill="#8B8A70" rx="9" ry="5" /><ellipse cx="559" cy="304" fill="#A49A7B" rx="11" ry="6" />
      </g>

      <path d="M442 350c18-34 43-51 76-55 35-4 62 12 82 39v16z" fill="#47764B" opacity=".9" />
      <g fill="#79A650">
        <ellipse cx="459" cy="326" rx="18" ry="9" transform="rotate(-25 459 326)" /><ellipse cx="487" cy="318" rx="16" ry="8" transform="rotate(24 487 318)" />
        <ellipse cx="535" cy="326" rx="18" ry="9" transform="rotate(-19 535 326)" /><ellipse cx="566" cy="315" rx="15" ry="7" transform="rotate(28 566 315)" />
      </g>
      <g fill="#FFD875" opacity=".88">
        <circle cx="290" cy="238" r="2" /><circle cx="320" cy="270" r="1.6" /><circle cx="423" cy="252" r="1.8" /><circle cx="530" cy="233" r="1.5" />
      </g>
      <rect fill="#FFFFFF" filter={`url(#${texture})`} height="350" opacity=".48" width="600" />
    </svg>
  );
}
