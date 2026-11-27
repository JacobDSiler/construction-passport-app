import json,sys,re
lang=sys.argv[1]; keys=json.load(open('tools/keys.json'))
out={}
bad=0
for line in open(f'tools/tr/{lang}.txt',encoding='utf8'):
    line=line.rstrip('\n')
    if not line.strip(): continue
    m=re.match(r'^(\d+)\|(.*)$',line)
    if not m: bad+=1; continue
    i=int(m.group(1)); 
    if i>=len(keys): bad+=1; continue
    t=m.group(2).replace('\\n','\n')
    if t.strip(): out[keys[i]]=t
json.dump(out,open(f'src/i18n/{lang}.json','w'),ensure_ascii=False,indent=0)
print(lang,'translated',len(out),'of',len(keys),'bad lines',bad)
