const generateForm = document.querySelector('.generate-form');
const imgGallery = document.querySelector('.img-gallery');

const OPENAI_API_KEY = "";

const generateAiImages = async (userPrompt, userImgQuantity) => {
    try{
        const response = await fetch("https://api.openai.com/v1/images/generations", {
            method: "POST",
            headers: {
                "Content-Type": "application/json", 
                "Authorization": `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                prompt: userPrompt,
                n: userImgQuantity,
                size: "512x512",
                response_format: "b64_json"
            })
        });
    } catch (error) {
        console.log("error");
    }
}

const handleFormSubmission = (e) => {
    e.preventDefault();

    //get data from form
    const userPrompt = e.srcElement[0].value;
    const userImgQuantity = e.srcElement[1].value;

    //Creating HTML mark for img cards with loading state
    const imgCardMarkup = Array.from({length: userImgQuantity}, () =>
        `<div class="img-card loading">
            <img src="img/loader.svg" alt="image">
            <a> <i class='bx bxs-download'></i> </a>
        </div>`
    ).join("");

    imgGallery.innerHTML = imgCardMarkup;
    generateAiImages(userPrompt, userImgQuantity);
}

generateForm.addEventListener("submit", handleFormSubmission);