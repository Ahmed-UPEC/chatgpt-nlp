const chatInput = document.querySelector("#chat-input");
const sendButton = document.querySelector("#send-btn");
const chatContainer = document.querySelector(".chat-container");
const typingContainer = document.querySelector(".typing-container");
const themeButton = document.querySelector("#theme-btn");
const deleteButton = document.querySelector("#delete-btn");
const avatarButton = document.querySelector("#avatar-btn");

let userText = null;
const API_KEY = "PASTE-YOUR-API-KEY-HERE"; // Paste your API key here
//const FLASK_API_URL = "https://flask-python-2fjtj4bjkq-lm.a.run.app"; // Flask API URL
const FLASK_API_URL =
  "https://b905-2a01-cb04-72e-2c00-f0ad-1b3c-7fc3-55fa.ngrok-free.app"; // Flask API URL
const FLASK_API_URL_RENDER = "https://attendanceapi-i0pn.onrender.com"; // Flask API URL
const RENDER_CHATBOT_API = "https://chatbot-retrival1.onrender.com"; // New API URL Chatbot

const loadDataFromLocalstorage = () => {
  // Load saved chats and theme from local storage and apply/add on the page
  const themeColor = localStorage.getItem("themeColor");

  document.body.classList.toggle("light-mode", themeColor === "light_mode");
  themeButton.innerText = document.body.classList.contains("light-mode")
    ? "dark_mode"
    : "light_mode";

  const defaultText = `<div class="default-text">
                            <h1>ChatGPT + NLP</h1>
                            <p>Start a conversation and explore the power of AI.<br> Your chat history will be displayed here.<br> <strong style='opacity:0.1; margin-top:5px'>Credit : ASMS</strong></p>
                        </div>`;

  chatContainer.innerHTML = localStorage.getItem("all-chats") || defaultText;
  chatContainer.scrollTo(0, chatContainer.scrollHeight); // Scroll to bottom of the chat container
};

const removeSessionID = async () => {
  // send api request to remove memory
  let sessionID = localStorage.getItem("sessionID");
  if (sessionID == null) {
    // sessionID is not in the local storage
    const time = new Date().getTime(); // timestamp
    localStorage.setItem("sessionID", time);
    sessionID = time;
    sessionID = sessionID.toString();
  }
  console.log("sessionID", sessionID);

  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      memory_stat: "remove",
      prompt: "remove",
      user_ID: sessionID,
    }),
  };

  try {
    const response = await (
      await fetch(RENDER_CHATBOT_API + "/chatbot", requestOptions)
    ).json();
    if (response.status === 400) {
      console.log("error");
    }
    console.log(response);
    // remove sessionID from local storage
    localStorage.removeItem("sessionID");
  } catch (error) {
    console.log(error);
  }
};

const createChatElement = (content, className) => {
  // Create new div and apply chat, specified class and set html content of div
  const chatDiv = document.createElement("div");
  chatDiv.classList.add("chat", className);
  chatDiv.innerHTML = content;
  return chatDiv; // Return the created chat div
};

const getChatResponse = async (incomingChatDiv) => {
  //const API_URL = "https://api.openai.com/v1/completions";
  const pElement = document.createElement("p");

  // Define the properties and data for the API request

  // check if there is data in the local storage with the key "all-chats"
  if (localStorage.getItem("all-chats") == null) {
    localStorage.setItem("all-chats", "");
  }

  const memory_stat = localStorage.getItem("all-chats") ? "remember" : "create";
  console.log("memory_stat", memory_stat);

  // get sessionID from local storage
  let sessionID = localStorage.getItem("sessionID");
  if (sessionID == null) {
    const time = new Date().getTime(); // timestamp
    localStorage.setItem("sessionID", time);
    sessionID = time; // 1704962028458
    sessionID = sessionID.toString();
  }
  console.log("sessionID", sessionID);

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
    /* body: JSON.stringify({
            engine: "text-web-001",
            prompt: userText,
        }) */
    body: JSON.stringify({
      memory_stat: memory_stat,
      prompt: userText,
      user_ID: sessionID,
    }),
  };

  // Send POST request to API, get response and set the reponse as paragraph element text
  try {
    // const response = await (await fetch(FLASK_API_URL + "/nlp/prompt", requestOptions)).json();
    const response = await (
      await fetch(RENDER_CHATBOT_API + "/chatbot", requestOptions)
    ).json();
    //pElement.textContent = response.choices[0].text.trim();
    if (response.status === 400) {
      pElement.classList.add("error");
      pElement.textContent = "Engine not available. Please try again later.";
    }
    pElement.textContent = response.text;
    
    sendMessageToAvatar(response.text);
    console.log(response);
  } catch (error) {
    // Add error class to the paragraph element and set error text
    pElement.classList.add("error");
    pElement.textContent =
      "Oops! Something went wrong while retrieving the response. Please try again.";
  }

  // Remove the typing animation, append the paragraph element and save the chats to local storage
  incomingChatDiv.querySelector(".typing-animation").remove();
  incomingChatDiv.querySelector(".chat-details").appendChild(pElement);
  localStorage.setItem("all-chats", chatContainer.innerHTML);
  chatContainer.scrollTo(0, chatContainer.scrollHeight);
};

const copyResponse = (copyBtn) => {
  // Copy the text content of the response to the clipboard
  div = copyBtn.parentElement;
  const reponseTextElement = div.parentElement.querySelector("p");
  navigator.clipboard.writeText(reponseTextElement.textContent);
  copyBtn.textContent = "done";
  setTimeout(() => (copyBtn.textContent = "content_copy"), 2000);
  addSmallPopUp("Copy to Clipboard", "blue");
};

const getQ_A = async (copyBtn) => {
  if (copyBtn.textContent == "thumb_up") {
    feedback = "Like";
  } else {
    feedback = "Dislike";
  }

  div = copyBtn.parentElement;
  div_chat_content = div.parentElement;
  div_chat_ingoing = div_chat_content.parentElement;
  div_chat_outgoing = div_chat_ingoing.previousElementSibling;
  p_div_chat_outgoing = div_chat_outgoing.querySelector("p").textContent;
  reponseTextElement = div.parentElement.querySelector("p").textContent;

  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    //body: p_div_chat_outgoing + "split_me_there" + reponseTextElement + "split_me_there" + feedback
    body: JSON.stringify({
      Question: p_div_chat_outgoing,
      Answer: reponseTextElement,
      Feedback: feedback,
      Engine: "text-web-001",
    }),
  };

  setTimeout(() => copyBtn.remove(), 2000);

  if (feedback == "Dislike") {
    copyBtn.classList.add("material-symbols-outlined");
    copyBtn.classList.remove("material-symbols-rounded");
    copyBtn.style.color = "red";
    addSmallPopUp("Feedback saved", "red");
  }

  // Send POST request to API, get response and set the reponse as paragraph element text
  try {
    //const response = await (await fetch(FLASK_API_URL + "/nlp/feedback", requestOptions)).json(); // this saves the feedback in a excel file
    const response = await (
      await fetch(FLASK_API_URL_RENDER + "/feedback", requestOptions)
    ).json();
    console.log("Feedback saved");
    //pElement.textContent = response.choices[0].text.trim();
    if (response.status === 400) {
      console.log("error");
    }
    console.log(response);
  } catch (error) {
    // Add error class to the paragraph element and set error text
    console.log(error);
  }
};

const getExcel = async (copyBtn) => {
  // get request to download the excel file
  const requestOptions = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  };

  try {
    const response = await fetch(
      FLASK_API_URL + "/nlp/download-excel",
      requestOptions
    );
    const blob = await response.blob();

    /* if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        } */

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "chatbot.xlsx");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Error downloading Excel file:", error);
  }
};

const showTypingAnimation = () => {
  // Display the typing animation and call the getChatResponse function
  const html = `<div class="chat-content">
                    <div class="chat-details">
                        <!-- <img src="images/chatbot.jpg" alt="chatbot-img"> -->
                        <img src="images/upec_logo.png" alt="chatbot-img">
                        <div class="typing-animation">
                            <div class="typing-dot" style="--delay: 0.2s"></div>
                            <div class="typing-dot" style="--delay: 0.3s"></div>
                            <div class="typing-dot" style="--delay: 0.4s"></div>
                        </div>
                    </div>
                    <div class="display-flex-icons">
                        <!-- thumbs_up_down, content_copy -->
                        <span onclick="copyResponse(this)" class="material-symbols-rounded">content_copy</span>
                        <span onclick="getQ_A(this)" class="material-symbols-rounded">thumb_down</span>

                        <!-- <span onclick="getQ_A(this)" class="material-symbols-rounded">thumb_up</span> -->
                        <!-- dowload the excel file -->
                        <!-- <span onclick="getExcel(this)" class="material-symbols-rounded">download</span> -->
                    </div>
                </div>`;
  // Create an incoming chat div with typing animation and append it to chat container
  const incomingChatDiv = createChatElement(html, "incoming");
  chatContainer.appendChild(incomingChatDiv);
  chatContainer.scrollTo(0, chatContainer.scrollHeight);
  getChatResponse(incomingChatDiv);
};

const handleOutgoingChat = () => {
  userText = chatInput.value.trim(); // Get chatInput value and remove extra spaces
  if (!userText) return; // If chatInput is empty return from here

  // Clear the input field and reset its height
  chatInput.value = "";
  chatInput.style.height = `${initialInputHeight}px`;

  const html = `<div class="chat-content">
                    <div class="chat-details">
                        <img src="images/ico.jpg" alt="user-img">
                        <p>${userText}</p>
                    </div>
                </div>`;

  // Create an outgoing chat div with user's message and append it to chat container
  const outgoingChatDiv = createChatElement(html, "outgoing");
  chatContainer.querySelector(".default-text")?.remove();
  chatContainer.appendChild(outgoingChatDiv);
  chatContainer.scrollTo(0, chatContainer.scrollHeight);
  setTimeout(showTypingAnimation, 500);
};

deleteButton.addEventListener("click", () => {
  // Remove the chats from local storage and call loadDataFromLocalstorage function
  let bool =
    confirm("Are you sure you want to delete all the chats?") &&
    localStorage.getItem("all-chats") != null;
  if (bool) {
    localStorage.removeItem("all-chats");
    loadDataFromLocalstorage();
    removeSessionID();
  }
});

avatarButton.addEventListener("click", () => {
  // add the avatar to the website
  console.log("avatarButton");
  // toggle the avatar display
  const avatar = document.querySelector(".avatarPanel");
  avatar.style.display = avatar.style.display === "block" ? "none" : "block";
  if (avatar.style.display === "block") {
    document.querySelector(".chatbot-grid").style.cssText =
      "grid-template-columns: 3fr 2fr; flex-grow: 0.75;";
    // connect to Truliance API
    startCall();
  } else {
    document.querySelector(".chatbot-grid").style.cssText =
      "grid-template-columns: 1fr";
    // disconnect to Truliance API
    endCall();
  }
});

themeButton.addEventListener("click", () => {
  // Toggle body's class for the theme mode and save the updated theme to the local storage
  document.body.classList.toggle("light-mode");
  localStorage.setItem("themeColor", themeButton.innerText);
  themeButton.innerText = document.body.classList.contains("light-mode")
    ? "dark_mode"
    : "light_mode";
});

const initialInputHeight = chatInput.scrollHeight;

chatInput.addEventListener("input", () => {
  // Adjust the height of the input field dynamically based on its content
  chatInput.style.height = `${initialInputHeight}px`;
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

// small popup

const addSmallPopUp = (text, color) => {
  const html = `<div class="small-popup-container ${color}_popup">
                    <p>${text}</p>
                </div>`;
  console.log("addSmallPopUp");
  // Create an outgoing chat div with user's message and append it to chat container
  const smallPopUp = createChatElement(html, "small-popup");
  typingContainer.appendChild(smallPopUp);
  setTimeout(() => smallPopUp.remove(), 2000);
};

window.onbeforeunload = function () {
  localStorage.removeItem("all-chats");
  localStorage.removeItem("sessionID");
};
