#!/usr/bin/env python3
import os
h=os.path.dirname(os.path.abspath(__file__));r=lambda n:open(os.path.join(h,'src',n),encoding='utf-8').read()
js=(r('shared.js')+'\n'+r('app.js')).replace("'use strict';\n",'')
html=f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Amanah</title><meta name="theme-color" content="#F3F5F7">
<meta name="mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-title" content="Amanah">
<link rel="manifest" href="manifest.webmanifest"><link rel="icon" href="icon-192.png"><link rel="apple-touch-icon" href="apple-touch-icon.png">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Noto+Sans+Ethiopic:wght@400;600;700&display=swap">
<style>
{r('style.css')}
{r('extra.css')}
</style></head><body>
<div id="app"></div><div id="sheetRoot"></div><div id="confRoot"></div>
<input type="file" id="photoIn" accept="image/*" hidden>
<nav class="nav" id="nav" aria-label="Main"><div class="in" id="navIn"></div></nav>
<div id="toast" class="toast" role="status" aria-live="polite" hidden></div>
<script>
window.__SW__=true;
(function(){{
'use strict';
{js}
}})();
</script></body></html>
'''
open(os.path.join(h,'index.html'),'w',encoding='utf-8').write(html);print(len(html))
