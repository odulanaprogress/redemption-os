const fs = require('fs');
const path = require('path');

const replacements = [
  { regex: /bg-\[\#0a0e1a\]/g, replace: "bg-[#F8F9FF]" },
  { regex: /bg-\[\#0f1420\]/g, replace: "bg-[#F8F9FF]" },
  { regex: /bg-\[\#1a1f2e\](?:\/(?:80|90|95|40))?/g, replace: "bg-white" },
  { regex: /border-white\/(?:10|20|30)/g, replace: "border-[#E5E7EB]" },
  { regex: /text-white\/40/g, replace: "text-[#9CA3AF]" },
  { regex: /text-white\/(?:50|60)/g, replace: "text-[#6B7280]" },
  { regex: /text-white\/(?:70|80)/g, replace: "text-[#4B5563]" },
  { regex: /text-white\/90/g, replace: "text-[#111827]" },
  { regex: /(?<!-)text-white(?!\/)/g, replace: "text-[#0D0D0D]" },
  { regex: /bg-white\/5/g, replace: "bg-[#F8F9FF]" },
  { regex: /bg-white\/10/g, replace: "bg-[#F3F4F6]" },
  { regex: /from-\[\#0ea5e9\] to-\[\#10b981\]/g, replace: "from-[#5B4FE8] to-[#8B82F0]" },
  { regex: /from-\[\#0a0e1a\] via-\[\#0f1420\] to-\[\#0a1628\]/g, replace: "from-[#F8F9FF] to-white" },
  { regex: /text-\[\#0ea5e9\]/g, replace: "text-[#5B4FE8]" },
  { regex: /bg-\[\#0ea5e9\]\/10/g, replace: "bg-[#EDE9FE]" },
  { regex: /border-\[\#0ea5e9\]\/30/g, replace: "border-[#5B4FE8]/30" },
  { regex: /bg-\[\#10b981\]\/10/g, replace: "bg-emerald-50" },
  { regex: /text-\[\#10b981\]/g, replace: "text-[#059669]" },
  { regex: /bg-\[\#a78bfa\]\/10/g, replace: "bg-[#EDE9FE]" },
  { regex: /text-\[\#a78bfa\]/g, replace: "text-[#5B4FE8]" },
  { regex: /bg-\[\#1a1f2e\]/g, replace: "bg-white" }
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      // skip files we just fully rewrote
      if (fullPath.includes('admin-dashboard.tsx') || fullPath.includes('login-page.tsx')) continue;
      
      let content = fs.readFileSync(fullPath, 'utf8');
      let original = content;
      
      for (const { regex, replace } of replacements) {
        content = content.replace(regex, replace);
      }
      
      if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDirectory('./src/app');
processDirectory('./src/components');
console.log('Done!');
