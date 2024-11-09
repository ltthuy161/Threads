function loadComponent(componentId, filePath) {
  return new Promise((resolve, reject) => {
    fetch(filePath)
      .then((response) => {
        if (!response.ok) {
          reject(new Error(`Failed to load ${filePath}`)); 
        }
        return response.text();
      })
      .then((data) => {
        document.getElementById(componentId).innerHTML = data;
        resolve(); 
      })
      .catch((error) => {
        console.error(error);
        reject(error); 
      });
  });
}


function setActiveIcon(activeIconId) {
  const icons = document.querySelectorAll('.icon'); 
  icons.forEach((icon) => {
    if (icon.id === activeIconId) {
      icon.classList.add('active');
      icon.classList.remove('inactive');
    } else {
      icon.classList.add('inactive');
      icon.classList.remove('active');
    }
  });
}