function copyToClipboard(buttonElement) {
  const emailAddress = buttonElement.textContent.trim();
  const toast = document.getElementById("copy-toast");

  if (emailAddress && toast) {
    navigator.clipboard
      .writeText(emailAddress)
      .then(() => {
        toast.classList.add("show");
        setTimeout(() => {
          toast.classList.remove("show");
        }, 2000);
      })
      .catch((err) => {
        console.error("Erreur", err);
      });
  }
}
