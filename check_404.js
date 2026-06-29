fetch('http://localhost:8080/src/main.tsx')
  .then(res => res.text())
  .then(text => console.log(text))
  .catch(err => console.error(err));
