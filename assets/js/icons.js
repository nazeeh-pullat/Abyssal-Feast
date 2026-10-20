/* Inline SVG icon set (24x24, currentColor). window.AF_ICON(name) returns an <svg> string. No emoji anywhere on the site. */
(function () {
  const S = (d) => d;
  const P = {
    tap: S('<path d="M9 11V5.5a1.5 1.5 0 0 1 3 0V10m0-1.5a1.5 1.5 0 0 1 3 0V11m0-.5a1.5 1.5 0 0 1 3 0V16a6 6 0 0 1-6 6h-.5a6 6 0 0 1-5-2.7L4 15.5a1.5 1.5 0 0 1 2.4-1.7L9 16"/>'),
    fish: S('<path d="M2.5 12c3-5 8-6 12-4l5-3v14l-5-3c-4 2-9 1-12-4z"/><circle cx="8" cy="11" r="1" fill="currentColor" stroke="none"/>'),
    school: S('<g transform="translate(0 -3) scale(.62)"><path d="M2.5 12c3-5 8-6 12-4l5-3v14l-5-3c-4 2-9 1-12-4z"/></g><g transform="translate(9 9) scale(.62)"><path d="M2.5 12c3-5 8-6 12-4l5-3v14l-5-3c-4 2-9 1-12-4z"/></g><g transform="translate(1 11) scale(.5)"><path d="M2.5 12c3-5 8-6 12-4l5-3v14l-5-3c-4 2-9 1-12-4z"/></g>'),
    growth: S('<path d="M3 17l6-6 4 4 8-8M15 7h6v6"/>'),
    bolt: S('<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>'),
    waves: S('<path d="M2 8q2.5-3 5 0t5 0t5 0t5 0M2 13q2.5-3 5 0t5 0t5 0t5 0M2 18q2.5-3 5 0t5 0t5 0t5 0"/>'),
    swirl: S('<path d="M12 12m-1.5 0a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0-3 0M12 7a5 5 0 1 1-5 5M12 3a9 9 0 1 1-9 9"/>'),
    log: S('<rect x="2" y="8.5" width="19" height="7" rx="3.5" transform="rotate(-18 12 12)"/><circle cx="18.2" cy="9.6" r="1.1"/>'),
    star: S('<path d="M12 2.5l2.9 6.2 6.8.8-5 4.7 1.3 6.7L12 17.5l-6 3.4 1.3-6.7-5-4.7 6.8-.8z"/>'),
    map: S('<path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2zM9 4v14M15 6v14"/>'),
    swords: S('<path d="M14.5 17.5L3 6V3h3l11.5 11.5M13 19l6-6M16 16l4 4M19 21l2-2M14.5 6.5L18 3h3v3l-3.5 3.5M5 14l4 4M7 17l-3 3M3 19l2 2"/>'),
    flame: S('<path d="M12 2c1 4 5 6 5 11a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-4-1-6 1-10z"/>'),
    hat: S('<path d="M7 15V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v9M3 18.5h18M5 15h14v3.5H5z"/>'),
    tank: S('<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M3 9h18M8 15c1-1.6 3.2-1.6 4.4 0-1.2 1.6-3.4 1.6-4.4 0zM16.5 14.5h.01"/>'),
    trophy: S('<path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H4v1a3 3 0 0 0 4 3M16 6h4v1a3 3 0 0 1-4 3M12 13v4M8 21h8M10 17h4"/>'),
    music: S('<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>'),
    gamepad: S('<path d="M6 8h12a4 4 0 0 1 4 4v3a3 3 0 0 1-5 2l-1-1H8l-1 1a3 3 0 0 1-5-2v-3a4 4 0 0 1 4-4zM7 10.5v3M5.5 12h3M15.5 11.5h.01M18 13.5h.01"/>'),
    lock: S('<rect x="5" y="11" width="14" height="10" rx="2.5"/><path d="M8 11V7.5a4 4 0 0 1 8 0V11"/>'),
    dice: S('<rect x="3.5" y="3.5" width="17" height="17" rx="4"/><circle cx="8.5" cy="8.5" r="1" fill="currentColor" stroke="none"/><circle cx="15.5" cy="8.5" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="8.5" cy="15.5" r="1" fill="currentColor" stroke="none"/><circle cx="15.5" cy="15.5" r="1" fill="currentColor" stroke="none"/>'),
    sliders: S('<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>'),
    leaf: S('<path d="M5 19C5 10 10 5 20 4c0 10-5 15-14 15zM5 19l8-8"/>'),
    play: S('<path d="M7 4.5l13 7.5-13 7.5z" fill="currentColor"/>'),
    chat: S('<path d="M4 5h16v11H9.5L4 20z"/>'),
    mail: S('<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M3.5 7.5L12 13l8.5-5.5"/>'),
    check: S('<path d="M5 12.5l5 5L19.5 7"/>'),
    x: S('<path d="M6 6l12 12M18 6L6 18"/>'),
    left: S('<path d="M19 12H5M11 6l-6 6 6 6"/>'),
    right: S('<path d="M5 12h14M13 6l6 6-6 6"/>'),
    speaker: S('<path d="M4 9v6h4l5 4V5L8 9zM16.5 8.5a5 5 0 0 1 0 7M19.5 5.5a9 9 0 0 1 0 13"/>'),
    heart: S('<path d="M12 20.5s-8-4.8-8-10.8A4.4 4.4 0 0 1 12 7a4.4 4.4 0 0 1 8 2.7c0 6-8 10.8-8 10.8z" fill="currentColor"/>'),
    phone: S('<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/>'),
    wifioff: S('<path d="M2.5 9a15 15 0 0 1 19 0M5.5 12.6a10.5 10.5 0 0 1 13 0M8.8 16a5.5 5.5 0 0 1 6.4 0M12 19.5h.01M3.5 3.5l17 17"/>'),
    ban: S('<circle cx="12" cy="12" r="9"/><path d="M5.7 5.7l12.6 12.6"/>'),
    shield: S('<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>'),
    warn: S('<path d="M12 3.5l10 17.5H2z"/><path d="M12 10v5M12 18h.01"/>'),
    puffer: S('<circle cx="11" cy="12" r="6.5"/><path d="M11 2.5v2.5M11 19v2.5M1.5 12H4M18 12h1.5M4.3 5.3l1.8 1.8M15.9 16.9l1.8 1.8M4.3 18.7l1.8-1.8M15.9 7.1l1.8-1.8M17.5 12l4.5-3.5v7z"/><circle cx="8.6" cy="10.6" r=".9" fill="currentColor" stroke="none"/>'),
    dot: S('<circle cx="12" cy="12" r="5" fill="currentColor"/>'),
    crown: S('<path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z"/>'),
  };
  window.AF_ICON = function (n, cls) {
    return '<svg class="ic' + (cls ? " " + cls : "") + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + (P[n] || P.dot) + "</svg>";
  };
})();
