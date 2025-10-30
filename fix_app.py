#!/usr/bin/env python3
import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Fix the problematic line
content = re.sub(
    r"content: 'I\\\\'m sorry, I\\\\'m having trouble responding right now\. This might be due to API limitations\. Please try again in a moment\.'",
    'content: "I\'m sorry, I\'m having trouble responding right now. This might be due to API limitations. Please try again in a moment."',
    content
)

with open('src/App.tsx', 'w') as f:
    f.write(content)

print("Fixed App.tsx")
