const chatInput = document.querySelector("#chat-input");
const sendButton = document.querySelector("#send-btn");
const chatContainer = document.querySelector(".chat-container");
const themeButton = document.querySelector("#theme-btn");
const deleteButton = document.querySelector("#delete-btn");

let userText = null;
const API_KEY = "PASTE-YOUR-API-KEY-HERE"; // Paste your API key here
const FLASK_API_URL = "https://flask-python-2fjtj4bjkq-lm.a.run.app"; // Flask API URL

const loadDataFromLocalstorage = () => {
    // Load saved chats and theme from local storage and apply/add on the page
    const themeColor = localStorage.getItem("themeColor");

    document.body.classList.toggle("light-mode", themeColor === "light_mode");
    themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";

    const defaultText = `<div class="default-text">
                            <h1>ChatGPT + NLP</h1>
                            <p>Start a conversation and explore the power of AI.<br> Your chat history will be displayed here.<br> <strong style='opacity:0.1; margin-top:5px'>Credit : CodingNepal</strong></p>
                        </div>`

    chatContainer.innerHTML = localStorage.getItem("all-chats") || defaultText;
    chatContainer.scrollTo(0, chatContainer.scrollHeight); // Scroll to bottom of the chat container
}

const createChatElement = (content, className) => {
    // Create new div and apply chat, specified class and set html content of div
    const chatDiv = document.createElement("div");
    chatDiv.classList.add("chat", className);
    chatDiv.innerHTML = content;
    return chatDiv; // Return the created chat div
}

const getChatResponse = async (incomingChatDiv) => {
    //const API_URL = "https://api.openai.com/v1/completions";
    const pElement = document.createElement("p");

    // Define the properties and data for the API request
    const requestOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            //"Authorization": `Bearer ${API_KEY}`
        },
        /* body: JSON.stringify({
            model: "text-davinci-003",
            prompt: userText,
            max_tokens: 2048,
            temperature: 0.2,
            n: 1,
            stop: null
        }) */
        body: JSON.stringify({
            engine: "text-web-001",
            prompt: userText,
        })
    }

    // Send POST request to API, get response and set the reponse as paragraph element text
    try {
        const response = await (await fetch(FLASK_API_URL + "/nlp/prompt", requestOptions)).json();
        //pElement.textContent = response.choices[0].text.trim();
        if (response.status === 400) {
            pElement.classList.add("error");
            pElement.textContent = "Engine not available. Please try again later.";
        }
        pElement.textContent = response.text
        console.log(response);
    } catch (error) { // Add error class to the paragraph element and set error text
        pElement.classList.add("error");
        pElement.textContent = "Oops! Something went wrong while retrieving the response. Please try again.";
    }

    // Remove the typing animation, append the paragraph element and save the chats to local storage
    incomingChatDiv.querySelector(".typing-animation").remove();
    incomingChatDiv.querySelector(".chat-details").appendChild(pElement);
    localStorage.setItem("all-chats", chatContainer.innerHTML);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
}

const copyResponse = (copyBtn) => {
    // Copy the text content of the response to the clipboard
    div = copyBtn.parentElement
    const reponseTextElement = div.parentElement.querySelector("p");
    navigator.clipboard.writeText(reponseTextElement.textContent);
    copyBtn.textContent = "done";
    setTimeout(() => copyBtn.textContent = "content_copy", 1000);
}

const getQ_A = async (copyBtn) => {

    if (copyBtn.textContent == "thumb_up") {
        feedback = "good"
    } else {
        feedback = "bad"
    }

    div = copyBtn.parentElement
    div_chat_content = div.parentElement
    div_chat_ingoing = div_chat_content.parentElement
    div_chat_outgoing = div_chat_ingoing.previousElementSibling
    p_div_chat_outgoing = div_chat_outgoing.querySelector("p").textContent
    reponseTextElement = div.parentElement.querySelector("p").textContent;
    
    const requestOptions = {
        method: "POST",
        headers: {
            "Content-Type": "texp/plain",
        },
        body: p_div_chat_outgoing + "split_me_there" + reponseTextElement + "split_me_there" + feedback
    }
    
    // Send POST request to API, get response and set the reponse as paragraph element text
    try {
        const response = await (await fetch(FLASK_API_URL + "/nlp/feedback", requestOptions)).json();
        //pElement.textContent = response.choices[0].text.trim();
        if (response.status === 400) {
            console.log("error")
        }
        console.log(response);
    } catch (error) { // Add error class to the paragraph element and set error text
        console.log(error)
    }
}

const getExcel = async (copyBtn) => {
    // get request to download the excel file
    const requestOptions = {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    }

    try {
        const response = await fetch(FLASK_API_URL + "/nlp/download-excel", requestOptions);
        const blob = await response.blob();

        /* if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        } */

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'chatbot.xlsx');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error('Error downloading Excel file:', error);
    }
    
}

const showTypingAnimation = () => {
    // Display the typing animation and call the getChatResponse function
    const html = `<div class="chat-content">
                    <div class="chat-details">
                        <img src="images/chatbot.jpg" alt="chatbot-img">
                        <div class="typing-animation">
                            <div class="typing-dot" style="--delay: 0.2s"></div>
                            <div class="typing-dot" style="--delay: 0.3s"></div>
                            <div class="typing-dot" style="--delay: 0.4s"></div>
                        </div>
                    </div>
                    <div>
                        <span onclick="copyResponse(this)" class="material-symbols-rounded">content_copy</span>
                        <!-- thumbs_up_down, content_copy -->
                        <span onclick="getQ_A(this)" class="material-symbols-rounded">thumb_up</span>
                        <span onclick="getQ_A(this)" class="material-symbols-rounded">thumb_down</span>
                        <!-- dowload the excel file -->
                        <span onclick="getExcel(this)" class="material-symbols-rounded">download</span>
                    </div>
                </div>`;
    // Create an incoming chat div with typing animation and append it to chat container
    const incomingChatDiv = createChatElement(html, "incoming");
    chatContainer.appendChild(incomingChatDiv);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
    getChatResponse(incomingChatDiv);
}

const handleOutgoingChat = () => {
    userText = chatInput.value.trim(); // Get chatInput value and remove extra spaces
    if(!userText) return; // If chatInput is empty return from here

    // Clear the input field and reset its height
    chatInput.value = "";
    chatInput.style.height = `${initialInputHeight}px`;

    const html = `<div class="chat-content">
                    <div class="chat-details">
                        <img src="images/user.jpg" alt="user-img">
                        <p>${userText}</p>
                    </div>
                </div>`;

    // Create an outgoing chat div with user's message and append it to chat container
    const outgoingChatDiv = createChatElement(html, "outgoing");
    chatContainer.querySelector(".default-text")?.remove();
    chatContainer.appendChild(outgoingChatDiv);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
    setTimeout(showTypingAnimation, 500);
}

deleteButton.addEventListener("click", () => {
    // Remove the chats from local storage and call loadDataFromLocalstorage function
    if(confirm("Are you sure you want to delete all the chats?")) {
        localStorage.removeItem("all-chats");
        loadDataFromLocalstorage();
    }
});

themeButton.addEventListener("click", () => {
    // Toggle body's class for the theme mode and save the updated theme to the local storage 
    document.body.classList.toggle("light-mode");
    localStorage.setItem("themeColor", themeButton.innerText);
    themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";
});

const initialInputHeight = chatInput.scrollHeight;

chatInput.addEventListener("input", () => {   
    // Adjust the height of the input field dynamically based on its content
    chatInput.style.height =  `${initialInputHeight}px`;
    chatInput.style.height = `${chatInput.scrollHeight}px`;
});

chatInput.addEventListener("keydown", (e) => {
    // If the Enter key is pressed without Shift and the window width is larger 
    // than 800 pixels, handle the outgoing chat
    if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
        e.preventDefault();
        handleOutgoingChat();
    }
});

loadDataFromLocalstorage();
sendButton.addEventListener("click", handleOutgoingChat);