document.addEventListener('DOMContentLoaded', function() {
    const usuarioLogado = localStorage.getItem('usuarioLogado');
    const token = localStorage.getItem('token');

    if (!usuarioLogado || !token) {
      window.location.href = '../html/login.html';
      return;
    }

    const logoutBtn = document.querySelector('a[href="../html/login.html"]');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', function(e) {
        e.preventDefault();

        localStorage.removeItem('usuarioLogado');
        localStorage.removeItem('token');
  
        window.location.href = '../html/login.html';
      });
    }
  });