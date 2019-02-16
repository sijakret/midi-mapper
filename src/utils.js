export function loadFile(dropEvent) {
  return new Promise(resolve => {
    const file = dropEvent.dataTransfer.files[0];
    const reader = new FileReader();
    reader.onload = function(event) {
      //console.log(event.target.result);
      resolve(event.target.result);
      //holder.style.background = 'url(' + event.target.result + ') no-repeat center';
    };
    console.log(file);
    reader.readAsArrayBuffer(file);
    dropEvent.preventDefault();
  });
}

export function displayMinutes(m) {
  return `${Math.floor(m)}.${Math.round(60*(m-Math.floor(m)))}`
}

export function download(content, filename, contentType = 'application/octet-stream') {
  const a = document.createElement('a');
  const blob = new Blob([content], {'type':contentType});
  a.href = window.URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}