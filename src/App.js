import React, { useState, useEffect, useRef } from 'react';
import parse from 'html-react-parser';
import socketIOClient from 'socket.io-client';
import styled from 'styled-components';
import DIlogo from './DIlogo.png';
import titleLogo from './titleLogo.png';
import restartIcon from './restart.png';
import sendIcon from './sendButton.png';
import enlargeIcon from './enlargeIcon.png';
import shrinkIcon from './shrinkIcon.png';

const placeholderSOCKET_SERVER_URL = "https://den-megtige-maskine.onrender.com";
const placeholderAPI = "https://den-megtige-maskine.onrender.com/api/v1/prediction/f0243d9a-338a-4adf-82c5-fb037a667a8e";

const TypingIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin: 0.32em 0.64em; // Spacing around each message
`;

const LoadingIndicator = styled.div`
  display: flex;
  justify-content: left;
  margin: 0.7em;
  margin-top: 1.6em;
  align-items: center;

  & > div {
    background-color: #333; /* Color of the dots */
    width: 0.35em;
    height: 0.35em;
    margin: 0 0.11em;
    border-radius: 50%;
    animation: fadeInOut 0.6s infinite;
  }

  & > div:nth-child(2) {
    animation-delay: 0.2s;
  }

  & > div:nth-child(3) {
    animation-delay: 0.4s;
  }

  @keyframes fadeInOut {
    0% {
      opacity: 0.2;
    }
    50% {
      opacity: 1;
    }
    100% {
      opacity: 0.2;
    }
  }
`;

const TitleBar = styled.div`
  background-color: ${props => props.themeColor || '#5083e3'};
  color: white; /* White text */
  padding: 0.64em; /* Some padding around the elements */
  display: flex;
  align-items: center;
  border-top-left-radius: 0.64em; /* Match the border radius of ChatWindow for the top corners */
  border-top-right-radius: 0.64em;
`;

const Logo = styled.img`
  height: 1.9em;
  width: ${props => props.titleG ? '1.9em' : 'auto'};
  margin-right: 0.64em;
`;

const Title = styled.h1`
  flex-grow: 1; /* Allows the title to take up the remaining space */
  margin: 0; /* Remove default margin */
  font-size: 1em; /* Adjust size as needed */
  color: white;
  font-family: 'Sans-Serif', Trebuchet MS;
`;

const PoweredBy = styled.div`
  text-align: center;
  margin-bottom: 0.5em;
  font-size: 0.64em;

  a {
    color: ${props => props.themeColor || '#007bff'}; // Adjust the color to fit your design
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const CloseButton = styled.div`
  position: absolute;
  color: white;
  top: 0em; /* Adjusts the distance from the top of the TitleBar */
  right: 0.1em; /* Adjusts the distance from the right of the TitleBar */
  cursor: pointer;
  font-size: 1.8em; /* Adjust if necessary */
  line-height: 1;
  padding: 0.3em; /* Gives space around the 'x' for easier clicking */
  &:hover {
    opacity: 0.7;
  }
`;

const RestartButton = styled.img`
  position: absolute;
  top: 1em; 
  right: 2.4em; // Adjust this so it doesn't overlap with the CloseButton
  cursor: pointer;
  width: 1.33em; // Set an appropriate size for the image
  height: 1.33em; // Maintain the aspect ratio
  &:hover {
    opacity: 0.7;
  }
`;

const EnlargeButton = styled.img`
  position: absolute;
  top: 1em; 
  right: 4.2em; // Adjust this so it doesn't overlap with the CloseButton
  cursor: pointer;
  width: 1.33em; // Set an appropriate size for the image
  height: 1.33em; // Maintain the aspect ratio
  &:hover {
    opacity: 0.7;
  }
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.9em;
`;

const HeaderLogo = styled.img`
  height: 3.9em; // Adjust as necessary to avoid stretching
  padding: 0.64em;
`;

const HeaderTitle = styled.h2`
  color: #333; /* Dark text for the title */
  margin: 0em; /* Reset default margin */
  font-size: 1.1em;
  text-align: center;
`;

const HeaderSubtitle = styled.p`
  color: #666; /* Lighter text for the subtitle */
  margin: 0.064em; /* Reset default margin */
  font-size: 0.88em;
  text-align: center;
`;

const ChatWindow = styled.div`
  position: fixed;
  bottom: 0.5em;
  right: 0.5em;
  width: 97vw;
  height: 97vh;
  background-color: white;
  box-shadow: 0 0.3em 0.5em rgba(0, 0, 0, 0.1);
  border-radius: 0.8em;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const MessageLogo = styled.img`
  height: 1.3em; // Adjust to the size you need
  width: 1.3em; // Maintain aspect ratio
  margin-right: 0em; // Space between logo and text
  margin-top: 1em;
`;

const MessageContainer = styled.div`
  display: flex;
  align-items: flex-start; // Aligns the image and text at the top
  justify-content: ${({ $isUser }) => ($isUser ? 'flex-end' : 'flex-start')};
  margin: 0.32em 0.64em; // Spacing around each message
`;

const Message = styled.div`
  white-space: pre-line; /* Honors new line characters in text */
  font-family: 'Open Sans', sans-serif;
  font-weight: 400;
  padding: 0.6em 0.64em 0.64em 0.64em;
  margin: 0.45em;
  border-radius: 0.64em;
  background-color: ${({ $isUser, themeColor }) => ($isUser ? themeColor : '#e9ecef')};
  color: ${({ $isUser }) => ($isUser ? 'white' : 'black')};
  align-self: ${({ $isUser }) => ($isUser ? 'flex-end' : 'flex-start')};
  max-width: 75%;
  width: fit-content;
  word-break: break-word; // This will break long words to prevent overflow
  margin-left: ${({ $isUser }) => ($isUser ? 'auto' : '0.64em')}; /* Auto margin for user messages */
  margin-right: ${({ $isUser }) => ($isUser ? '0.64em' : 'auto')}; /* Auto margin for AI messages */
`;

const InputContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0em;
  margin-bottom: 0em; // Ensure space for the send button
`;

const SendButton = styled.img`
  cursor: pointer;
  width: 1.3em;
  height: 1.3em;
  position: absolute;
  right: 1.15em; // You can adjust this based on your design needs
  bottom: 0.75em; // Adjust based on the size of ChatInput to vertically align it
`;

const ChatInput = styled.input`
  background-color: white;
  padding: 0.64em; /* Padding inside the input */
  padding-right: 3.2em; /* Padding inside the input */
  border: none; /* No border */
  border-radius: 0.64em; /* Rounded corners */
  margin: 1.2em; /* Margin from the edges of the ChatWindow */
  margin-bottom: 0.5em;
  width: calc(100% - 1.3em); /* Full width inside the ChatWindow with margin */
  box-sizing: border-box; /* Border and padding should be included in the width and height */
  outline: 0.064em solid #A9A9A9; /* Gray outline */
  outline-offset: 0.13em; /* Distance between outline and border */
  
  &:focus {
    outline: 0.064em solid #007bff; /* Blue outline on focus */
  }

  &::placeholder {
    color: #A9A9A9; /* Placeholder text color */
  }
`;

const isImageUrl = (url) => {
  return /\.(jpeg|jpg|gif|png|webp)(\?.*)?$/.test(url) || /(format=webp)/.test(url);
};

const App = () => {
  const [conversation, setConversation] = useState([]);
  const [conversationHis, setConversationHis] = useState([]);
  const [message, setMessage] = useState('');
  const [socketIOClientId, setSocketIOClientId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEnlarged, setIsEnlarged] = useState(false);

  const socket = useRef(null);

  const [apiEndpoint, setApiEndpoint] = useState('');
  const [titleLogoG, setTitleLogoG] = useState('');
  const [headerLogoG, setHeaderLogoG] = useState('');
  const [themeColor, setThemeColor] = useState('');
  const [pagePath, setPagePath] = useState('');
  const [headerTitleG, setHeaderTitleG] = useState('');
  const [headerSubtitleG, setHeaderSubtitleG] = useState('');
  const [titleG, setTitleG] = useState('');
  const [SOCKET_SERVER_URL, setSocketServerUrl] = useState('');
  const [startMessage, setStartMessage] = useState('');

  useEffect(() => {
    const handleMessage = (event) => {
      // Handle the message based on the action
      if (event.data && event.data.action === 'integrationOptions') {
        // Set your API endpoint state here
        setApiEndpoint(event.data.apiEndpoint);
        setTitleLogoG(event.data.titleLogoG);
        setHeaderLogoG(event.data.headerLogoG);
        setThemeColor(event.data.themeColor);
        setPagePath(event.data.pagePath);
        setHeaderTitleG(event.data.headerTitleG);
        setHeaderSubtitleG(event.data.headerSubtitleG);
        setTitleG(event.data.titleG);
        setSocketServerUrl(event.data.SOCKET_SERVER_URL);
        setStartMessage(event.data.startMessage);
      }
    };

    // Add the event listener
    window.addEventListener('message', handleMessage);

    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  useEffect(() => {
    const initialMessage = startMessage || "Hej, hvad kan jeg hjælpe dig med?";
    setConversation([{ text: initialMessage, isUser: false }]);
    setConversationHis([{ content: initialMessage, role: "apiMessage" }]);
  }, [startMessage]);

  useEffect(() => {
    socket.current = socketIOClient(SOCKET_SERVER_URL || placeholderSOCKET_SERVER_URL);

    socket.current.on('connect', () => {
      setSocketIOClientId(socket.current.id);
    });

    socket.current.on('start', () => {
      setConversation(prevConv => [...prevConv, { text: '', isUser: false }]);
    });

    socket.current.on('token', (token) => {
      setIsLoading(false);
      setConversation(prevConv => {
        const newConv = [...prevConv];
        const lastMessageIndex = newConv.length - 1;
        newConv[lastMessageIndex] = {
          ...newConv[lastMessageIndex],
          text: newConv[lastMessageIndex].text + token,
        };
        return newConv;
      });
    });

    socket.current.on('end', () => { });

    return () => {
      socket.current.disconnect();
    };
  }, [SOCKET_SERVER_URL]);

  const sendMessage = async () => {
    // Start loading state
    setIsLoading(true);

    // Ensure the message is not empty
    if (!message.trim()) {
      console.error("Message is empty.");
      setIsLoading(false); // Stop loading state if there is an error
      return;
    }

    const tempHis = conversationHis;
    tempHis.splice(0, tempHis.length - 5);
    setConversationHis(tempHis);

    // Add the user message to the conversationHis
    setConversationHis(prevHis => [...prevHis, {
      content: message,
      role: "userMessage"
    }]);

    // Add the message to the conversation
    setConversation(prevConv => [...prevConv, { text: message, isUser: true }]);
    setMessage(''); // Clear the input after sending

    try {
      // Use the apiEndpoint from the state in your fetch call
      const response = await fetch(apiEndpoint || placeholderAPI, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer wEfLmtcJ4Mj2DODkFDWq2ggjjJ6gJ125sJJpfMR/Aeg=", // Ensure this is secure
        },
        body: JSON.stringify({ question: /*"dato: " + formattedDate + "\n" + */message, "history": conversationHis, socketIOClientId }),
      });

      if (response.ok) {
        const jsonResponse = await response.json();

        const apiResponseMessage = jsonResponse.text;
        // Add the API response message to the conversationHis
        setConversationHis(prevHis => [...prevHis, {
          content: apiResponseMessage,
          role: "apiMessage"
        }]);

      } else {
        console.error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Sending message failed:', error);
    } finally {
      setIsLoading(false); // Stop loading state after the request
    }
  };

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const toggleSize = () => {
    setIsEnlarged(!isEnlarged);
    window.parent.postMessage({ action: 'toggleSize' }, pagePath); // Ensure the domain is correct for security
  };

  // Custom function to parse and style Markdown headers
  const parseMarkdownHeaders = (text) => {
    // Split text into lines to check for Markdown headers
    return text.split('\n').map(line => {
      if (line.startsWith('### ')) { // Checks for headers
        return `<h3>${line.replace('### ', '')}</h3>`; // Replaces and wraps with h3 tags
      } else {
        return line; // Returns the line unchanged if not a header
      }
    }).join('<br>'); // Joins lines back with line breaks for HTML
  };

  const resetChat = () => {
    // Optionally: Disconnect existing socket connection
    socket.current.disconnect();

    // Reset conversation
    const initialMessage = startMessage || "Hej, hvad kan jeg hjælpe dig med?";
    setConversation([{ text: initialMessage, isUser: false }]);
    setConversationHis([{ content: initialMessage, role: "apiMessage" }]);

    // Reset other relevant states (e.g., message, isLoading)
    setMessage('');
    setIsLoading(false);

    // Optionally: Reconnect the socket connection if you've disconnected it
    socket.current.connect();
  };

  useEffect(scrollToBottom, [conversation]);

  function closeChat() {
    window.parent.postMessage({ action: 'closeChat' }, pagePath); // Make sure this matches the actual parent domain
  }

  // Get the current date
  const currentDate = new Date();

  // Format the date as desired
  const year = currentDate.getFullYear();
  const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
  const day = currentDate.getDate().toString().padStart(2, '0');

  // Display the date in YYYY-MM-DD format
  const formattedDate = `${year}-${month}-${day}`;

  const renderMessageContent = (text) => {
    // Handle markdown links and strong tags
    const markdownLinkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
    const strongTagPattern = /\*\*(.*?)\*\*/g;

    let parsedText = [];
    let lastIndex = 0;

    // Replace markdown links
    text = text.replace(markdownLinkPattern, (match, linkText, linkUrl) => {
      return isImageUrl(linkUrl) ? `<img src="${linkUrl}" alt="${linkText}" style="max-width: 100%; margin: 0.5em 0;" />` : `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${linkText}</a>`;
    });

    // Replace strong tags
    text = text.replace(strongTagPattern, '<strong>$1</strong>');

    // Handle line breaks
    text = text.replace(/<br>/g, '\n');

    return parse(text);
  };

  return (
    <>
      <ChatWindow>
        <TitleBar themeColor={themeColor}>
          <Logo src={titleLogoG || titleLogo} alt="Logo" titleG={titleG} />
          <Title>{titleG}</Title>
          <RestartButton
            src={restartIcon} // Replace with the actual path to your restart button image
            alt="Restart Chat"
            onClick={resetChat}
          />
          <CloseButton onClick={closeChat}>×</CloseButton>
          <EnlargeButton
            src={isEnlarged ? shrinkIcon : enlargeIcon}
            alt="Toggle Size"
            onClick={toggleSize}
          />
        </TitleBar>
        <div style={{ flexGrow: 1, overflow: 'auto' }}>
          <Header>
            <HeaderLogo src={headerLogoG || DIlogo} alt="Logo" />
            <HeaderTitle>{headerTitleG || "Dialog Intelligens AI"}</HeaderTitle>
            <HeaderSubtitle>{headerSubtitleG || "Vores virtuelle assistent er her for at hjælpe dig."}</HeaderSubtitle>
          </Header>
          {conversation.map((entry, index) => {
            const formattedText = entry.text
              .replace(/\n- /g, "\n\u2022 ") // Bullet points
              .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>"); // Bold text

            const textWithHeaders = parseMarkdownHeaders(formattedText); // Fixed function call

            const isUser = entry.isUser;
            const messageClasses = isUser ? "userMessage" : "aiMessage"; // Differentiate styles

            return (
              <MessageContainer key={index} $isUser={isUser}>
                {!isUser && <MessageLogo src={headerLogoG || DIlogo} alt="AI Logo" />}
                <Message $isUser={isUser} themeColor={themeColor || '#5083e3'}>
                  <div className={messageClasses}>{renderMessageContent(textWithHeaders)}</div>
                </Message>
              </MessageContainer>
            );
          })}

          {isLoading && (
            <TypingIndicator>
              <MessageLogo src={headerLogoG || DIlogo} alt="AI Logo" />
              <LoadingIndicator>
                <div></div>
                <div></div>
                <div></div>
              </LoadingIndicator>
            </TypingIndicator>
          )}
          <div ref={messagesEndRef} /> {/* Invisible element to scroll into view */}
        </div>
        <InputContainer>
          <ChatInput
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Skriv dit spørgsmål her..."
          />
          {message && (
            <SendButton
              src={sendIcon}
              alt="Send"
              onClick={sendMessage}
            />
          )}
        </InputContainer>
        <PoweredBy themeColor={themeColor}>
          Powered by <a href="https://dialogintelligens.dk" target="_blank" rel="noopener noreferrer">Dialog Intelligens</a>
        </PoweredBy>
      </ChatWindow>
    </>
  );
};

export default App;
