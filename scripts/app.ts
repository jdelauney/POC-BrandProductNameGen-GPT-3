const form = document.querySelector<HTMLFormElement>("form")!
const submitButton = document.querySelector<HTMLButtonElement>('button')!
const footer = document.querySelector<HTMLElement>("article > footer")!

type apiPostData = {
  apiKey : string
  type: string
  theme: string
  genre: string
  numberOfProposals : number
}
const setLoading = () => {
  submitButton.setAttribute("aria-busy", "true")
  submitButton.disabled = true
  footer.textContent = "Génération des noms en cours"
  footer.setAttribute("aria-busy", "true")
}

const removeLoading = () => {
  footer.setAttribute("aria-busy", "false")
  submitButton.setAttribute("aria-busy", "false")
  submitButton.disabled = false
}

const generatePrompt = (postFormData: apiPostData): string => {
  return `Génère-moi ${postFormData.numberOfProposals} idées de nom ${postFormData.genre} pour ${postFormData.type} avec comme thème ${postFormData.theme}`
}

const strRightOf = (value: string, searchStr: string, startPos = 0): string => {
  const pos = value.indexOf(searchStr, startPos);
  if (pos >= value.length - 1) {
    return '';
  }
  return value.slice(pos + 1, value.length);
};

const responseDataToHtml = (data : string): string => {
  return data
    .split("\n")
    .map((str) => {
      const strTrimed = str.trim()
      if (strTrimed.length > 1) {
        return `<li>${strRightOf(str, '.')}</li>`
      }
    })
    .join("")
}
const generateNames = (postFormData: apiPostData) => {
  setLoading()
  fetch("https://api.openai.com/v1/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${postFormData.apiKey}`
    },
    body: JSON.stringify({
      prompt: generatePrompt(postFormData),
      max_tokens: 256,
      model: "text-davinci-003"
    })
  })
  .then(response => response.json())
    .then(data => {
       footer.innerHTML = `<h2><b>Propositions</b>&nbsp;:</h2>  <ol>${responseDataToHtml(data.choices[0].text)}</ol>`
    })
    .finally(() => {
      removeLoading()
    })
}

form.addEventListener("submit", (evt: SubmitEvent) => {
  evt.preventDefault()
  const formData = new FormData(form)
  const postData: apiPostData = {
    apiKey: formData.get('apikey')!.toString().trim(),
    type: formData.get('typeName')!.toString().trim(),
    theme: formData.get('theme')!.toString().trim(),
    genre: formData.getAll('genre').join(', '),
    numberOfProposals: Number(formData.get('num')?.toString())
  }
  generateNames(postData)
})
