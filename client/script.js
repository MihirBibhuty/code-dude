import bot from './assets/bot.svg';
import user from './assets/user.svg';

// adjusting height of textarea
const textarea = document.querySelector('textarea');
textarea.addEventListener("keyup", (e) => {
    textarea.style.height = "auto";
    let scHeight = e.target.scrollHeight;
    textarea.style.height = `${scHeight}px`;
});

let readOutAloud = false;
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
        console.log(readOutAloud);
        if (readOutAloud === true) {
            readOut(parsedData);
        }
    } else {
        const err = await response.text();
        messageDiv.innerHTML = `<div style="color: red">Something went wrong!</div>`;
        alert(err);
    }
}

form.addEventListener("submit", handleSubmit);
form.addEventListener("keyup", (e) => {
    if (e.keyCode === 13) {
        handleSubmit(e);
    }
})


// Navbar JS
const elment = document.querySelector('.hamburger');
const elment1 = document.querySelector('.nav-list');

elment.addEventListener("click", () => {
    elment.classList.toggle('active');
    elment1.classList.toggle('active');
})


// Speech to Text JS
const mic = document.getElementById('mic');

try {
    const speechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new speechRecognition();

    recognition.onstart = () => {
        console.log("Voice is activated");
    }
    // recognition.onspeechend = () => {}

    recognition.onresult = (e) => {
        console.log(e);
        const transcript = e.results[0][0].transcript;
        textarea.value = transcript;
        mic.style.border = "none";
        readOutAloud = true;
        handleSubmit(e);
    }

    // add event listner to the mic button
    mic.addEventListener("click", () => {
        mic.style.border = "2px solid red";
        recognition.start();
    })

} catch (err) {
    console.log(err);
    alert(err);
}

// mic.addEventListener("click", () => {
//     mic.style.border = "2px solid red";
//     let recognition = new webkitSpeechRecognition();

//     if (!recognition) {
//         alert("Your browser doesnot support Speech Recognition!");
//     }

//     recognition.lang = "en-GB";
//     recognition.onresult = (e) => {
//         console.log(e);
//         textarea.value = e.results[0][0].transcript;
//         mic.style.border = "none";
//     }
//     recognition.start();
// })

const readOut = (message) => {
    const speech = new SpeechSynthesisUtterance();
    let voices = window.speechSynthesis.getVoices();
    speech.text = message;
    speech.volume = 1;
    speech.rate = 2;
    speech.pitch = 1;
    speech.voice = voices.filter(function (voice) { return voice.name == 'Google UK English Female (en-GB)'; })[0];

    window.speechSynthesis.speak(speech);
}