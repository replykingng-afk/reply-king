/* ============================================================
   REPLY KING WIDGET 👑
   Drop this script tag on ANY website:
   <script src="widget.js"></script>
   That's it. No build step, no npm, no React.
   ============================================================ */

(function () {
  "use strict";

  /* ------------------------------------------------------------
     1. CONFIG — edit this one line with your real Apps Script URL
     ------------------------------------------------------------ */
  var APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyAv70MG-h_UTTtvIi25DP_OlI0iUPQdn7TW3hq0TIbRA1tS8sXAzq_ROAoDYnjRw04/exec";

  var BRAND = {
    green: "#25D366",
    bubbleText: "Chat with Reply King 👑",
    introMessage: "Reply King here 👑 How can I help you find property today?",
    footerText: "Powered by Reply King 👑"
  };

  var STORAGE_KEY = "replyking_contact"; // { name, email, phone }

  /* ------------------------------------------------------------
     2. STYLES — injected once, scoped with "rk-" prefix
     so we never clash with the host site's CSS.
     ------------------------------------------------------------ */
  var css = `
    #rk-bubble {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: ${BRAND.green};
      color: #fff;
      padding: 14px 18px;
      border-radius: 30px;
      font-family: -apple-system, Segoe UI, Roboto, Arial, sans-serif;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(0,0,0,0.25);
      z-index: 999999;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: transform 0.15s ease;
    }
    #rk-bubble:hover { transform: scale(1.05); }

    #rk-chatbox {
      position: fixed;
      bottom: 90px;
      right: 20px;
      width: 320px;
      max-width: 92vw;
      height: 440px;
      max-height: 75vh;
      background: #fff;
      border-radius: 14px;
      box-shadow: 0 8px 30px rgba(0,0,0,0.3);
      display: none;
      flex-direction: column;
      overflow: hidden;
      font-family: -apple-system, Segoe UI, Roboto, Arial, sans-serif;
      z-index: 999999;
    }
    #rk-chatbox.rk-open { display: flex; }

    #rk-header {
      background: ${BRAND.green};
      color: #fff;
      padding: 12px 14px;
      font-weight: 700;
      font-size: 15px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    #rk-close { cursor: pointer; font-size: 18px; line-height: 1; }

    #rk-messages {
      flex: 1;
      overflow-y: auto;
      padding: 12px;
      background: #f7f7f8;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .rk-msg {
      max-width: 80%;
      padding: 8px 12px;
      border-radius: 12px;
      font-size: 13px;
      line-height: 1.4;
      word-wrap: break-word;
    }
    .rk-msg-bot {
      background: #fff;
      border: 1px solid #e2e2e2;
      align-self: flex-start;
      border-bottom-left-radius: 2px;
    }
    .rk-msg-user {
      background: ${BRAND.green};
      color: #fff;
      align-self: flex-end;
      border-bottom-right-radius: 2px;
    }
    .rk-msg-typing {
      background: #fff;
      border: 1px solid #e2e2e2;
      align-self: flex-start;
      color: #999;
      font-style: italic;
    }

    #rk-form {
      border-top: 1px solid #eee;
      padding: 10px;
      background: #fff;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    #rk-form input, #rk-form textarea {
      width: 100%;
      box-sizing: border-box;
      padding: 8px 10px;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 13px;
      font-family: inherit;
      outline: none;
    }
    #rk-form input:focus, #rk-form textarea:focus {
      border-color: ${BRAND.green};
    }
    #rk-row { display: flex; gap: 6px; }
    #rk-row input { flex: 1; }

    #rk-send-btn {
      background: ${BRAND.green};
      color: #fff;
      border: none;
      border-radius: 8px;
      padding: 9px 0;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
    }
    #rk-send-btn:disabled { opacity: 0.6; cursor: not-allowed; }

    #rk-reset-link {
      font-size: 11px;
      color: #888;
      text-align: right;
      cursor: pointer;
      text-decoration: underline;
      margin-top: -2px;
    }

    #rk-footer {
      text-align: center;
      font-size: 11px;
      color: #666;
      padding: 4px 0 6px;
      background: #fff;
    }

    @media (max-width: 400px) {
      #rk-chatbox { right: 4vw; width: 92vw; bottom: 80px; }
    }
  `;
  var styleTag = document.createElement("style");
  styleTag.textContent = css;
  document.head.appendChild(styleTag);

  /* ------------------------------------------------------------
     3. BUILD THE DOM — bubble + chatbox, both injected into <body>
     ------------------------------------------------------------ */
  var bubble = document.createElement("div");
  bubble.id = "rk-bubble";
  bubble.innerHTML = "💬 " + BRAND.bubbleText;

  var chatbox = document.createElement("div");
  chatbox.id = "rk-chatbox";
  chatbox.innerHTML = `
    <div id="rk-header">
      <span>Reply King 👑</span>
      <span id="rk-close">✕</span>
    </div>
    <div id="rk-messages"></div>
    <div id="rk-form"></div>
    <div id="rk-footer">${BRAND.footerText}</div>
  `;

  document.body.appendChild(bubble);
  document.body.appendChild(chatbox);

  var messagesEl = chatbox.querySelector("#rk-messages");
  var formEl = chatbox.querySelector("#rk-form");
  var closeBtn = chatbox.querySelector("#rk-close");

  /* ------------------------------------------------------------
     4. CONTACT STORAGE — save once, reuse on every future visit
     ------------------------------------------------------------ */
  function getContact() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null; // localStorage can fail in some private-browsing modes
    }
  }

  function saveContact(contact) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(contact));
    } catch (e) {
      /* ignore — chat still works, it just won't remember next time */
    }
  }

  function clearContact() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
  }

  /* ------------------------------------------------------------
     5. RENDER MESSAGES
     ------------------------------------------------------------ */
  function addMessage(text, sender) {
    var div = document.createElement("div");
    div.className = "rk-msg " + (sender === "user" ? "rk-msg-user" : "rk-msg-bot");
    div.textContent = text;
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return div;
  }

  function addTyping() {
    var div = document.createElement("div");
    div.className = "rk-msg rk-msg-typing";
    div.textContent = "Reply King is typing…";
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return div;
  }

  /* ------------------------------------------------------------
     6. RENDER FORM — two modes:
     a) FIRST VISIT: Name + Email + Phone + Message
     b) RETURN VISIT: just Message (contact already known)
     ------------------------------------------------------------ */
  function renderForm() {
    var contact = getContact();
    formEl.innerHTML = ""; // clear previous form

    if (contact) {
      // ---- RETURNING USER: message box only ----
      formEl.innerHTML = `
        <textarea id="rk-message" rows="2" placeholder="Type your message…"></textarea>
        <button id="rk-send-btn">Send</button>
        <div id="rk-reset-link">Not ${escapeHtml(contact.name)}? Reset details</div>
      `;
      formEl.querySelector("#rk-reset-link").onclick = function () {
        clearContact();
        renderForm();
      };
    } else {
      // ---- FIRST-TIME USER: full contact form ----
      formEl.innerHTML = `
        <div id="rk-row">
          <input id="rk-name" type="text" placeholder="Name" />
          <input id="rk-phone" type="tel" placeholder="Phone" />
        </div>
        <input id="rk-email" type="email" placeholder="Email" />
        <textarea id="rk-message" rows="2" placeholder="Type your message…"></textarea>
        <button id="rk-send-btn">Send</button>
      `;
    }

    formEl.querySelector("#rk-send-btn").onclick = handleSend;

    // Allow Enter key in the message box to send (Shift+Enter = new line)
    var msgBox = formEl.querySelector("#rk-message");
    msgBox.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    });
  }

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.textContent = str || "";
    return div.innerHTML;
  }

  /* ------------------------------------------------------------
     7. SEND MESSAGE — talks to your Apps Script Web App
     ------------------------------------------------------------ */
  function handleSend() {
    var messageBox = formEl.querySelector("#rk-message");
    var message = messageBox.value.trim();
    if (!message) return;

    var contact = getContact();
    var nameInput = formEl.querySelector("#rk-name");
    var emailInput = formEl.querySelector("#rk-email");
    var phoneInput = formEl.querySelector("#rk-phone");

    // First-time visitor: pull values from the form fields and save them
    if (!contact) {
      contact = {
        name: (nameInput && nameInput.value.trim()) || "",
        email: (emailInput && emailInput.value.trim()) || "",
        phone: (phoneInput && phoneInput.value.trim()) || ""
      };
      // Require at least a name before we let them send — adjust if you want it optional
      if (!contact.name) {
        alert("Please enter your name so we can follow up with you.");
        return;
      }
      saveContact(contact);
      renderForm(); // switch UI to "returning user" mode immediately
    }

    addMessage(message, "user");
    messageBox.value = "";

    var sendBtn = formEl.querySelector("#rk-send-btn");
    sendBtn.disabled = true;

    var typingEl = addTyping();

    // IMPORTANT: we use a normal fetch (NOT mode:'no-cors') because
    // no-cors blocks us from ever reading the response body — we'd
    // send the lead but never see the bot's reply. Apps Script Web
    // Apps allow cross-origin requests by default when deployed with
    // "Who has access: Anyone", so a plain fetch works fine.
    fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      // Apps Script's doPost reads e.postData.contents and JSON.parses it,
      // so text/plain + JSON.stringify avoids a CORS preflight request.
      body: JSON.stringify({
        message: message,
        name: contact.name,
        email: contact.email,
        phone: contact.phone
      })
    })
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        typingEl.remove();
        addMessage(data && data.reply ? data.reply : "Thanks! We'll get back to you shortly.", "bot");
      })
      .catch(function (err) {
        typingEl.remove();
        addMessage("Hmm, something went wrong sending that. Please try again.", "bot");
        console.error("Reply King widget error:", err);
      })
      .finally(function () {
        sendBtn.disabled = false;
      });
  }

  /* ------------------------------------------------------------
     8. OPEN / CLOSE BEHAVIOUR
     ------------------------------------------------------------ */
  var hasOpenedBefore = false;

  bubble.addEventListener("click", function () {
    chatbox.classList.add("rk-open");
    bubble.style.display = "none";

    if (!hasOpenedBefore) {
      addMessage(BRAND.introMessage, "bot");
      renderForm();
      hasOpenedBefore = true;
    }
  });

  closeBtn.addEventListener("click", function () {
    chatbox.classList.remove("rk-open");
    bubble.style.display = "flex";
  });
})();
