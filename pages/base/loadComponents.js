function loadComponent(componentId, filePath) {
  fetch(filePath)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to load ${filePath}`);
        console.error(`Failed to load ${filePath}`);
      }
      return response.text();
    })
    .then((data) => {
      document.getElementById(componentId).innerHTML = data;
    })
    .catch((error) => console.error(error));
}
