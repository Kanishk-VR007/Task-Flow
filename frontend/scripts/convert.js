const fs = require('fs');
const path = require('path');

const inputFile = path.resolve(__dirname, '../../stitch_screens/TaskFlow - Complete Cinematic Landing Page_2b2446738c7a423696ae41251630deaa.html');
const outputFile = path.resolve(__dirname, '../src/components/LandingPage.jsx');

let html = fs.readFileSync(inputFile, 'utf8');

// Extract the body content
let bodyStart = html.indexOf('<body');
let bodyEnd = html.indexOf('</body>');

let bodyTagEnd = html.indexOf('>', bodyStart) + 1;
let bodyContent = html.substring(bodyTagEnd, bodyEnd);

// Wrap in a div instead of body
let bodyClassesMatch = html.substring(bodyStart, bodyTagEnd).match(/class="([^"]+)"/);
let bodyClasses = bodyClassesMatch ? bodyClassesMatch[1] : '';

let jsx = `<div className="${bodyClasses}">\n` + bodyContent + '\n</div>';

// Replace class= with className=
jsx = jsx.replace(/class=/g, 'className=');

// Replace for= with htmlFor=
jsx = jsx.replace(/for=/g, 'htmlFor=');

// Remove HTML comments
jsx = jsx.replace(/<!--[\s\S]*?-->/g, '');

// Close unclosed tags
jsx = jsx.replace(/<img([^>]*?)(?<!\/)>/g, '<img$1 />');
jsx = jsx.replace(/<input([^>]*?)(?<!\/)>/g, '<input$1 />');
jsx = jsx.replace(/<br([^>]*?)(?<!\/)>/g, '<br$1 />');
jsx = jsx.replace(/<hr([^>]*?)(?<!\/)>/g, '<hr$1 />');

// Handle SVG attributes
jsx = jsx.replace(/fill-rule=/g, 'fillRule=');
jsx = jsx.replace(/clip-rule=/g, 'clipRule=');
jsx = jsx.replace(/stroke-width=/g, 'strokeWidth=');
jsx = jsx.replace(/stroke-linecap=/g, 'strokeLinecap=');
jsx = jsx.replace(/stroke-linejoin=/g, 'strokeLinejoin=');
jsx = jsx.replace(/stroke-dasharray=/g, 'strokeDasharray=');

// Remove inline styles entirely
jsx = jsx.replace(/style="[^"]*"/g, '');

const finalComponent = `import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    ${jsx}
  );
};

export default LandingPage;
`;

fs.writeFileSync(outputFile, finalComponent);
console.log('Done');
