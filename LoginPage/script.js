document.getElementById('loginForm').addEventListener('submit', function (event) {
    event.preventDefault();
  
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
  
    // You should replace the following dummy data with actual data from your backend.
    const users = [
      { email: 'example@email.com', password: 'Password123' },
    ];
  
    const user = users.find(user => user.email === email && user.password === password);

    if (user) {
      alert('Login successful!');
    } else {
      document.getElementById('message').innerText = 'Invalid email or password.';
    }

  });