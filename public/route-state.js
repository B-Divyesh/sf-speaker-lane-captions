(() => {
  const path = window.location.pathname.replace(/\/+$/, '');
  const isDemo = path === '/demo' || new URLSearchParams(window.location.search).get('demo') === '1';
  if (isDemo) document.documentElement.classList.add('demo-route-pending');
})();
