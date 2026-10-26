const fs = require('fs');
const path = require('path');

const file = path.resolve(__dirname, '../src/components/LandingPage.jsx');
let content = fs.readFileSync(file, 'utf8');

// 1. Layer 1 Background
content = content.replace(
  /<img alt="Cinematic Sunset Mountain Skyline" className="w-full h-full object-cover object-center scale-\[1\.02\]" src="https:\/\/lh3\.googleusercontent\.com\/aida\/[^"]+" \/>/,
  '<img alt="Cinematic Sunset Mountain Skyline" className="w-full h-full object-cover object-center scale-[1.02] animate-bg-pan-zoom" src="/HomePage Background.png" />'
);

// 2. Layer 2 Floating Elements
content = content.replace(
  '<div className="glass-panel absolute top-4 left-0 sm:left-4 w-52 sm:w-56 p-4 rounded-2xl z-20 transform hover:-translate-y-1 transition duration-300">',
  '<div className="glass-panel absolute top-4 left-0 sm:left-4 w-52 sm:w-56 p-4 rounded-2xl z-20 transform hover:-translate-y-1 transition duration-300 animate-float-slow">'
);
content = content.replace(
  '<div className="glass-panel absolute top-0 right-0 sm:right-4 w-64 sm:w-72 p-4 rounded-2xl z-30 transform hover:-translate-y-1 transition duration-300">',
  '<div className="glass-panel absolute top-0 right-0 sm:right-4 w-64 sm:w-72 p-4 rounded-2xl z-30 transform hover:-translate-y-1 transition duration-300 animate-float-medium">'
);
content = content.replace(
  '<div className="glass-panel absolute bottom-4 right-0 sm:right-2 w-64 sm:w-72 p-4 rounded-2xl z-20 transform hover:-translate-y-1 transition duration-300">',
  '<div className="glass-panel absolute bottom-4 right-0 sm:right-2 w-64 sm:w-72 p-4 rounded-2xl z-20 transform hover:-translate-y-1 transition duration-300 animate-float-fast">'
);

// 3. Layer 3 Light Trails & Layer 6 Particles
// I'll add an SVG and particle divs right before the closing of the 3D container
const trailsAndParticles = `
{/* Layer 3: Light Trails */}
<svg className="absolute inset-0 w-full h-full pointer-events-none -z-10" viewBox="0 0 500 440">
  <path className="animate-trail" fill="none" stroke="rgba(245,158,11,0.4)" strokeWidth="2" d="M 50,400 C 150,300 250,350 400,100" />
  <path className="animate-trail" fill="none" stroke="rgba(56,189,248,0.4)" strokeWidth="2" d="M 0,200 C 200,100 300,200 500,50" style={{animationDelay: '2s'}} />
  <path className="animate-trail" fill="none" stroke="rgba(192,132,252,0.4)" strokeWidth="2" d="M 100,440 C 200,250 400,300 450,0" style={{animationDelay: '4s'}} />
</svg>

{/* Layer 6: Particles */}
<div className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full bg-cyan-300 shadow-[0_0_12px_3px_rgba(56,189,248,0.9)] animate-particle"></div>
<div className="absolute bottom-1/3 left-10 w-1.5 h-1.5 rounded-full bg-amber-300 shadow-[0_0_10px_2px_rgba(251,191,36,0.9)] animate-particle" style={{animationDelay: '1s'}}></div>
<div className="absolute top-12 right-1/3 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_10px_2px_rgba(255,255,255,0.8)] animate-particle" style={{animationDelay: '2.5s'}}></div>
<div className="absolute top-1/2 right-10 w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_12px_3px_rgba(192,132,252,0.9)] animate-particle" style={{animationDelay: '1.5s'}}></div>
<div className="absolute bottom-12 right-1/4 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_10px_2px_rgba(56,189,248,0.8)] animate-particle" style={{animationDelay: '3s'}}></div>
`;

content = content.replace(
  /<div className="absolute top-1\/2 left-1\/4 w-2 h-2[^>]+><\/div>[\s\S]*?<div className="absolute top-12 right-1\/3 w-1\.5 h-1\.5[^>]+><\/div>/,
  trailsAndParticles
);

fs.writeFileSync(file, content);
console.log('Done');
