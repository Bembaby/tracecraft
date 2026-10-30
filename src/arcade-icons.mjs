export function arcadeIcon(name) {
  const paths={star:'m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L2.2 9.4l6.1-.9L12 3Z',
    battery:'M9 3h6v3h4v15H5V6h4V3Zm0 8h6m-3-3v6',gate:'M4 21V8l8-5 8 5v13M9 21v-7h6v7M4 9h16',
    bag:'M5 8h14l1 13H4L5 8Zm3 0V6a4 4 0 0 1 8 0v2',flask:'M9 3h6m-5 0v7l-6 9c-.6 1 .1 2 1 2h14c1 0 1.6-1 1-2l-6-9V3M7 16h10',
    chest:'M3 11h18v10H3V11Zm0 0V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v4M9 11v4h6v-4',
    check:'m5 12 4 4L19 6',play:'m8 4 12 8-12 8V4Z',arrow:'M4 12h16m-6-6 6 6-6 6',back:'M20 12H4m6-6-6 6 6 6',code:'m8 7-5 5 5 5m8-10 5 5-5 5m-3-14-2 18'};
  return `<svg viewBox="0 0 24 24" class="arcade-icon" aria-hidden="true"><path d="${paths[name]||paths.star}"/></svg>`;
}

