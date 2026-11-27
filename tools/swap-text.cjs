// Switches every file from react-native's Text to our bilingual Text.
const fs=require('fs'),path=require('path');
const files=[];(function w(d){for(const f of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,f.name);if(f.isDirectory())w(p);else if(/\.tsx$/.test(f.name))files.push(p)}})('app');(function w(d){for(const f of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,f.name);if(f.isDirectory())w(p);else if(/\.tsx$/.test(f.name))files.push(p)}})('src');
let n=0;
for(const f of files){ if(f.endsWith('components/Text.tsx')||f.endsWith('lib/i18n.tsx')) continue;
  let s=fs.readFileSync(f,'utf8');
  const m=s.match(/import\s*\{([^}]*)\}\s*from\s*'react-native';/); if(!m) continue;
  const names=m[1].split(',').map(x=>x.trim()).filter(Boolean); if(!names.includes('Text')) continue;
  const rest=names.filter(x=>x!=='Text');
  const rel=path.relative(path.dirname(f),'src/components/Text').split(path.sep).join('/'); const relp=rel.startsWith('.')?rel:'./'+rel;
  const repl=(rest.length?`import { ${rest.join(', ')} } from 'react-native';\n`:'')+`import { Text } from '${relp}';`;
  s=s.replace(m[0],repl); fs.writeFileSync(f,s); n++; }
console.log('updated',n);
