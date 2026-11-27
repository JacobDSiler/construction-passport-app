// Collects user-visible English strings from app/ and src/. Output: tools/strings.json
const ts = require('typescript'); const fs = require('fs'); const path = require('path');
const files = []; (function walk(d){ for (const f of fs.readdirSync(d,{withFileTypes:true})) { const p=path.join(d,f.name); if (f.isDirectory()) walk(p); else if (/\.tsx?$/.test(f.name)) files.push(p); } })('app'); (function walk(d){ for (const f of fs.readdirSync(d,{withFileTypes:true})) { const p=path.join(d,f.name); if (f.isDirectory()) walk(p); else if (/\.tsx?$/.test(f.name)) files.push(p); } })('src');
const out = new Map(); const dyn = new Map();
const skipFiles = /src\/lib\/(api|supabase|storage|owner)\.ts$/;
function looksText(s){ s=s.trim(); if(s.length<2||s.length>260) return false; if(!/[A-Za-z]{2}/.test(s)) return false; if(/^(https?:|\/|\.|#|@|cp\.|[a-z_]+\.[a-z_.]+$)/.test(s)) return false; if(/^[a-z][a-zA-Z0-9_]*$/.test(s)) return false; if(/^[A-Z0-9_]+$/.test(s) && s.length<4) return false; if(/^[\w-]+\/[\w\-\/\[\]()]+$/.test(s)) return false; if(/^(row|column|center|flex|absolute|relative|contain|cover|bold|normal|italic|none|auto|space-between|flex-start|flex-end|stretch|wrap|numeric|default|email-address|phone-pad|done|next|go|search|words|sentences|characters|body|rgb|rgba)/i.test(s) && !/\s/.test(s)) return false; if(/^[#0-9a-fA-F]{6,}$/.test(s)) return false; return true; }
function add(f,s,line){ s=s.replace(/&apos;|&#39;/g,"'").replace(/&quot;/g,'"').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/\s+/g,' ').trim(); if(!looksText(s)) return; const o=out.get(s)||{files:new Set()}; o.files.add(f); out.set(s,o); }
for (const f of files) {
  if (skipFiles.test(f)) continue;
  const src = fs.readFileSync(f,'utf8'); const sf = ts.createSourceFile(f, src, ts.ScriptTarget.Latest, true, f.endsWith('x')?ts.ScriptKind.TSX:ts.ScriptKind.TS);
  (function visit(n){
    if (ts.isImportDeclaration(n)||ts.isExportDeclaration(n)) return;
    if (ts.isJsxText(n)) add(f,n.getText());
    else if (ts.isStringLiteral(n)||ts.isNoSubstitutionTemplateLiteral(n)) {
      const p=n.parent; if (ts.isPropertyAssignment(p)&&p.name===n) {} else if (ts.isElementAccessExpression(p)) {} else add(f,n.text);
    } else if (ts.isTemplateExpression(n)) {
      let s=n.head.text, i=0; for (const sp of n.templateSpans){ s+='{'+(i++)+'}'+sp.literal.text; } 
      if (looksText(s.replace(/\{\d+\}/g,''))) { const o=dyn.get(s)||{files:new Set()}; o.files.add(f); dyn.set(s,o); }
    }
    ts.forEachChild(n,visit);
  })(sf);
}
const list=[...out.entries()].map(([s,o])=>({s,files:[...o.files]})); const dl=[...dyn.entries()].map(([s,o])=>({s,files:[...o.files]}));
fs.writeFileSync('tools/strings.json',JSON.stringify({static:list,dynamic:dl},null,1));
console.log('static',list.length,'dynamic',dl.length);
