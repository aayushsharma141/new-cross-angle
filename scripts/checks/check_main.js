fetch('http://localhost:8080/src/main.tsx')
  .then(res => {
     console.log('Status:', res.status);
     return res.text();
  })
  .then(text => console.log('Body length:', text.length))
  .catch(err => console.error(err));
