import bot from './assets/bot.svg';
import user from './assets/user.svg';

// adjusting height of textarea
const textarea = document.querySelector('textarea');
textarea.addEventListener("keyup", (e) => {
    textarea.style.height = "auto";
    let scHeight = e.target.scrollHeight;
    textarea.style.height = `${scHeight}px`;
});

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');

let loadInterval;

const loader = (element) => {
    element.textContent = '';

    loadInterval = setInterval(() => {
        element.textContent += '.';

        if (element.textContent === '....') {
            element.textContent = '';
        }
    }, 300);
}

const typeText = (element, text) => {
    let index = 0;

    let interval = setInterval(() => {
        if (index < text.length) {
            element.innerHTML += text.charAt(index);
            index++;

            // to focus scroll to the bottom
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
        else {
            clearInterval(interval);
        }
    }, 20);
}

const generateUniqueID = () => {
    const timeStamp = Date.now();
    const randomNumber = Math.random();
    const hexadecimalString = randomNumber.toString(16);

    return `id-${timeStamp}-${hexadecimalString}`;
}

const chatStripe = (isAI, value, uniqueID) => {
    return (
        `
            <div class="wrapper ${isAI && 'ai'}">
                <div class="chat">
                    <div class="profile">
                        <img
                            src="${isAI ? bot : user}"
                            alt="${isAI ? 'bot' : 'user'}"
                        />
                    </div>
                    <div class="message" id="${uniqueID}">${value}</div>
                </div>
            </div>
        `
    )
}

const handleSubmit = async (e) => {
    e.preventDefault();
    textarea.style.height = "auto";
    document.getElementById('hero').innerHTML = '';

    const data = new FormData(form);

    // user's chatstripe
    chatContainer.innerHTML += chatStripe(false, data.get('prompt'));
    form.reset();

    // bot's chatstripe
    const uniqueID = generateUniqueID();
    chatContainer.innerHTML += chatStripe(true, " ", uniqueID);

    // to focus scroll to the bottom
    chatContainer.scrollTop = chatContainer.scrollHeight;

    const messageDiv = document.getElementById(uniqueID);
    loader(messageDiv);


    // fetch data from the server -> bot's response
    const response = await fetch('https://code-dude.onrender.com', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            prompt: data.get('prompt')
        })
    });

    clearInterval(loadInterval);
    messageDiv.innerHTML = '';

    if (response.ok) {
        const data = await response.json();
        const parsedData = data.bot.trim();

        typeText(messageDiv, parsedData);
    } else {
        const err = await response.text();
        messageDiv.innerHTML = `<div style="color: red">Something went wrong</div>`;
        alert(err);
    }
}

form.addEventListener("submit", handleSubmit);
form.addEventListener("keyup", (e) => {
    if (e.keyCode === 13) {
        handleSubmit(e);
    }
})




const elment = document.querySelector('.hamburger');
const elment1 = document.querySelector('.nav-list');

elment.addEventListener("click", () => {
    elment.classList.toggle('active');
    elment1.classList.toggle('active');
})