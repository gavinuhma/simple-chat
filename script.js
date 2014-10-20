
function addMessage() {
  var newMsg = document.getElementById('newMsg');
  var msgs = document.getElementById('msgs');
  var msg = newMsg.value;
  var content = document.createElement('div');
  content.innerText = msg;
  msgs.appendChild(content);
}

