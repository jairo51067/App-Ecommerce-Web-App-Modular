function sanitize(input){
  return input.replace(/[<>]/g, "");
}

function login(){
  const user = sanitize(document.getElementById('user').value);
  const pass = sanitize(document.getElementById('pass').value);

  if(user === "admin" && pass === "1234"){
    document.getElementById('login').classList.add('hidden');
    document.getElementById('adminPanel').classList.remove('hidden');
  } else {
    alert("Acceso denegado");
  }
}