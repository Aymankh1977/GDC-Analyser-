const fs = require('fs');

// Read the App.tsx file
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Fix the specific line with escaped quotes
content = content.replace(
  /content: 'I\\\\'m sorry, I\\\\'m having trouble responding right now\. This might be due to API limitations\. Please try again in a moment\.'/,
  'content: "I\'m sorry, I\'m having trouble responding right now. This might be due to API limitations. Please try again in a moment."'
);

// Write the fixed content back
fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log('Fixed App.tsx');
