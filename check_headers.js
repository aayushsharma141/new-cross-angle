fetch('http://localhost:8080/src/main.tsx')
  .then(res => {
     console.log('Status:', res.status);
     console.log('Headers:');
     for (let [k, v] of res.headers.entries()) {
       console.log(k, v);
     }
  })
  .catch(err => console.error(err));
