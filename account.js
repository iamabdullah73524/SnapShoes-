// account.js - handles registration, login state, and navbar name display
(function(){
  const storageKey = 'snap_user';

  function getUser(){
    try{ return JSON.parse(localStorage.getItem(storageKey)); }catch(e){ return null; }
  }

  function setUser(user){
    localStorage.setItem(storageKey, JSON.stringify(user));
    updateUserLink();
  }

  function clearUser(){
    localStorage.removeItem(storageKey);
    updateUserLink();
  }

  function updateUserLink(){
    const user = getUser();
    const el = document.getElementById('user-link');
    if(!el) return;
    if(user && user.name){
      el.textContent = user.name.split(' ')[0];
      el.setAttribute('title', user.email || 'Account');
      el.classList.add('fw-bold');
    } else {
      el.innerHTML = '👤';
      el.setAttribute('title','Account');
      el.classList.remove('fw-bold');
    }
  }

  function generateCaptcha(){
    const a = Math.floor(Math.random()*9)+1;
    const b = Math.floor(Math.random()*9)+1;
    const sum = a + b;
    return { question: `${a} + ${b} = ?`, answer: sum };
  }

  // Expose helpers for pages
  window.SnapAccount = {
    getUser, setUser, clearUser, updateUserLink, generateCaptcha
  };

  // Update immediately on load
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', updateUserLink);
  } else updateUserLink();

})();
