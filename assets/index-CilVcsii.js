(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=[{id:`dragon-tears`,name:`Dragon Tears`,temperature:25,density:8,magicPower:10,icon:`dragon-tears`},{id:`fairy-dust`,name:`Fairy Dust`,temperature:12,density:9,magicPower:12,icon:`fairy-dust`},{id:`frost-lotus`,name:`Frost Lotus`,temperature:-18,density:4,magicPower:14,icon:`frost-lotus`},{id:`mandrake-root`,name:`Mandrake Root`,temperature:-5,density:20,magicPower:8,icon:`mandrake-root`},{id:`caustic-acid`,name:`Caustic Acid`,temperature:10,density:14,magicPower:22,icon:`caustic-acid`},{id:`essence-of-the-void`,name:`Essence of the Void`,temperature:-20,density:-10,magicPower:40,icon:`essence-of-the-void`},{id:`phoenix-feather`,name:`Phoenix Feather`,temperature:50,density:-10,magicPower:30,icon:`phoenix-feather`},{id:`toad-slime`,name:`Toad Slime`,temperature:5,density:30,magicPower:0,icon:`toad-slime`}].slice(0,6),t=2,n=14;function r(r=Math.random){let i={};for(let a of e)i[a.id]=Math.floor(r()*n)+t;return i}function i(e=Math.random){return{shelfStock:r(e),cauldronIngredients:[]}}function a(e,t){let n=e.shelfStock[t]??0;return n<1||e.cauldronIngredients.length>=4?e:{shelfStock:{...e.shelfStock,[t]:n-1},cauldronIngredients:[...e.cauldronIngredients,t]}}function o(e){return e.cauldronIngredients.length>=4}function s(e){return{...e,cauldronIngredients:[]}}function c(t){return e.some(e=>e.id===t)}var l={"dragon-tears":`<path d="M32 7c-7 10-15 19-15 31a15 15 0 0 0 30 0C47 26 39 17 32 7Z"/><path d="M26 42c1 4 4 6 8 6"/>`,"fairy-dust":`<path d="m32 8 5.5 16.5L54 30l-16.5 5.5L32 52l-5.5-16.5L10 30l16.5-5.5L32 8Z"/><path d="M49 8v9M44.5 12.5h9M13 45v7M9.5 48.5h7"/>`,"frost-lotus":`<path d="M32 11v42M14 21l36 22M14 43l36-22M27 16l5 5 5-5M27 48l5-5 5 5M14 27l7-1-1-7M50 37l-7 1 1 7M21 44l1-7-7 1M43 20l-1 7 7-1"/>`,"mandrake-root":`<path d="M32 49V28M32 34c-8 0-13-5-13-12 8 0 13 4 13 12ZM32 30c0-9 5-15 14-16 0 9-5 15-14 16ZM32 47c-5 2-8 5-10 10M32 47c4 2 6 5 7 10M32 47c-1 4-1 7 0 11"/>`,"caustic-acid":`<path d="M25 9h14M28 9v14L16 43a8 8 0 0 0 7 12h18a8 8 0 0 0 7-12L36 23V9M22 40h20M27 34l4 3 5-6"/>`,"essence-of-the-void":`<circle cx="32" cy="32" r="21"/><path d="M42 23a13 13 0 1 0 1 17 10 10 0 0 1-1-17ZM32 25v14M25 32h14"/>`,"phoenix-feather":`<path d="M48 9C25 12 14 25 15 42c1 8 7 13 15 12 17-1 24-18 18-45ZM16 49l22-26M25 39l-1-10M31 33l10 1M36 27l-1-9"/>`,"toad-slime":`<path d="M15 43c0-8 7-12 12-15 2-8 13-10 18-3 7 2 8 12 3 18-2 8-11 13-20 10-7 1-13-3-13-10Z"/><path d="M26 42h.01M40 40h.01M29 49c3 2 6 2 9 0"/>`};function u(e){return`<svg class="ingredient-icon" viewBox="0 0 64 64" aria-hidden="true" focusable="false">${l[e]}</svg>`}function d(e){return e>0?`+${e}`:e<0?`−${Math.abs(e)}`:`0`}function f(e,t,n){let r=t===0,i=r||n;return`
    <button class="ingredient-card${r?` ingredient-card--empty`:``}" type="button" data-ingredient-id="${e.id}" data-icon="${e.icon}"${i?` disabled`:``}>
      <span class="stock-badge" aria-label="${t} portions in stock">${t}</span>
      ${r?`<div class="ingredient-card__art ingredient-card__art--empty" aria-hidden="true"></div>`:`<div class="ingredient-card__art">${u(e.icon)}</div>`}
      <h3 class="ingredient-card__name">${e.name}</h3>
      <dl class="ingredient-values" aria-label="Ingredient values">
        <div class="ingredient-values__item">
          <dt>Temperature</dt>
          <dd>${d(e.temperature)}</dd>
        </div>
        <div class="ingredient-values__item">
          <dt>Density</dt>
          <dd>${d(e.density)}</dd>
        </div>
        <div class="ingredient-values__item">
          <dt>Magic power</dt>
          <dd>${d(e.magicPower)}</dd>
        </div>
      </dl>
    </button>`}function p(t){return t.length===0?`
      <div class="cauldron-illustration" aria-hidden="true">
        <span class="cauldron-steam cauldron-steam--one"></span>
        <span class="cauldron-steam cauldron-steam--two"></span>
        <svg viewBox="0 0 220 170" focusable="false">
          <path class="cauldron-rim" d="M37 64h146l-12 66a23 23 0 0 1-23 19H72a23 23 0 0 1-23-19L37 64Z" />
          <path class="cauldron-liquid" d="M48 89h124l-7 40a15 15 0 0 1-15 12H70a15 15 0 0 1-15-12l-7-40Z" />
          <path class="cauldron-highlight" d="M58 72h104M68 151l-7 10m91-10 7 10" />
          <circle class="cauldron-bubble cauldron-bubble--one" cx="87" cy="111" r="5" />
          <circle class="cauldron-bubble cauldron-bubble--two" cx="126" cy="123" r="3" />
          <circle class="cauldron-bubble cauldron-bubble--three" cx="143" cy="103" r="4" />
        </svg>
      </div>
      <p class="cauldron-empty-title">Waiting for its first brew</p>
      <p class="cauldron-empty-copy">The cauldron is clear and ready for your ingredients.</p>`:`<ol class="cauldron-ingredients" aria-label="Ingredients in cauldron">${t.map((t,n)=>{let r=e.find(e=>e.id===t);return r?`<li class="cauldron-ingredient" data-icon="${r.icon}">
      <span class="cauldron-ingredient__position">${n+1}</span>
      <span class="cauldron-ingredient__icon">${u(r.icon)}</span>
      <span class="cauldron-ingredient__name">${r.name}</span>
    </li>`:``}).join(``)}</ol>
    <p class="cauldron-empty-title cauldron-empty-title--filled">Ingredients added in order</p>
    <button class="clear-cauldron-button" type="button" data-action="clear-cauldron">Clear cauldron</button>`}function m(t){let n=o(t),r=e.map(e=>f(e,t.shelfStock[e.id]??0,n)).join(``),i=t.cauldronIngredients.length;return`
    <div class="game-shell">
      <header class="game-header">
        <div>
          <p class="eyebrow">A small craft of wonder</p>
          <h1>Alchemist's Cauldron</h1>
          <p class="game-intro">Gather curious ingredients and brew a potion worthy of the old apothecary.</p>
        </div>
        <div class="level-badge"><span></span>Level 1 <b>·</b> Medium</div>
      </header>

      <div class="game-board">
        <section class="shelf-panel" aria-labelledby="shelf-title">
          <div class="section-heading">
            <div>
              <p class="eyebrow">Your collection</p>
              <h2 id="shelf-title">Ingredient shelf</h2>
            </div>
            <span class="section-count">01 <i>/</i> 06</span>
          </div>
          <div class="ingredient-grid">${r}
          </div>
          <p class="shelf-note">Each ingredient is precious. Watch the stock badge as your supplies change.</p>
        </section>

        <aside class="cauldron-panel${n?` cauldron-panel--full`:``}" aria-labelledby="cauldron-title">
          <div class="section-heading section-heading--compact">
            <div>
              <p class="eyebrow">The brewing station</p>
              <h2 id="cauldron-title">Cauldron</h2>
            </div>
            <span class="cauldron-counter">${i} <i>/</i> 4</span>
          </div>
          ${p(t.cauldronIngredients)}
          <div class="capacity-meter" aria-label="Cauldron capacity: ${i} of 4 ingredients">
            <div class="capacity-meter__labels"><span>Cauldron capacity</span><strong>${i} / 4</strong></div>
            <div class="capacity-meter__track"><span style="width: ${i/4*100}%"></span></div>
          </div>
        </aside>
      </div>

      <footer class="game-footer"><span>Keep your notes close.</span><span>Every potion begins with a little curiosity.</span></footer>
    </div>`}var h=document.querySelector(`#app`);if(h===null)throw Error(`Required app root element "#app" was not found.`);var g=h,_=i();function v(){g.innerHTML=m(_)}g.addEventListener(`click`,e=>{let t=e.target;if(!(t instanceof Element))return;if(t.closest(`button[data-action="clear-cauldron"]`)){_=s(_),v();return}let n=t.closest(`button[data-ingredient-id]`),r=n?.dataset.ingredientId;r&&c(r)&&!n?.disabled&&(_=a(_,r),v())}),v();