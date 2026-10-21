const applicationRoot = document.querySelector<HTMLElement>("#app");

if (applicationRoot === null) {
  throw new Error('Required app root element "#app" was not found.');
}
