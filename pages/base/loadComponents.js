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
  const buttons = document.querySelectorAll('.navigation-button');
  buttons.forEach((button) => {
      const icon = button.querySelector('i');
      if (button.id === activeIconId) {
          icon.classList.add('active');
          icon.classList.remove('inactive');
          console.log(`${button.id} is now active`);
      } else {
          icon.classList.add('inactive');
          icon.classList.remove('active');
          console.log(`${button.id} is now inactive`);
      }
  });
}
