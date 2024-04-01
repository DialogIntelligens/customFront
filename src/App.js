import jsPDF from 'jspdf';
import React, { useState, useEffect } from 'react';
import socketIOClient from 'socket.io-client';

const SOCKET_SERVER_URL = "https://flowise-udvikling.onrender.com/";

const App = () => {
  const [question, setQuestion] = useState('');
  const [question2, setQuestion2] = useState('');
  const [question3, setQuestion3] = useState('');
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [socketIOClientId, setSocketIOClientId] = useState('');

  useEffect(() => {
    // Initialize socket connection inside useEffect
    const socket = socketIOClient(SOCKET_SERVER_URL);

    // Event handlers
    socket.on('connect', () => {
      setSocketIOClientId(socket.id);
    });

    socket.on('token', (token) => {
      setOutput((prevOutput) => prevOutput + token);
    });

    socket.on('start', () => {
      setOutput('');
      setIsLoading(true);
    });

    socket.on('end', () => {
      setIsLoading(false);
      setOutput(prevOutput => prevOutput + "\nStream complete.");
    });

    // Clean up on component unmount
    return () => {
      socket.off('connect');
      socket.off('token');
      socket.off('start');
      socket.off('end');
      socket.disconnect();
    };
  }, []);

  const sendQuestion = async () => {
    setIsLoading(true);
    // Don't clear the output if you want to keep the previous tokens
    // setOutput('');
    
    const data = {
      question: `Hvor skal luftledningerne gå imellem? ${question}. Hvilke type ledning er det? ${question2}. Hvor høj spænding skal det være? ${question3}.`,
      socketIOClientId,
    };
    
    try {
      const response = await fetch("https://flowise-udvikling.onrender.com/api/v1/prediction/4817bf28-e8ca-4b4d-92f9-0cab9107cfb9", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
    
      if (response.ok) {
        const result = await response.json();
        console.log(result);
        // Only set the waiting message if you are not expecting tokens from the socket
        // Otherwise, comment this line out
        // setOutput('Response received, waiting for stream...');
      } else {
        setOutput(`Error: ${response.status}`);
      }
    } catch (error) {
      console.error('Error during fetch:', error);
      setOutput('An error occurred while sending the question.');
    }
    
    setIsLoading(false);
  };

  // Function to make the API call
  async function query(data) {
    const response = await fetch(
      "https://flowise-udvikling.onrender.com/api/v1/prediction/4817bf28-e8ca-4b4d-92f9-0cab9107cfb9",
      {
          method: "POST",
          headers: {
              "Content-Type": "application/json"
          },
          body: JSON.stringify(data)
      }
    );
    const result = await response.json();
    return result;
  }

  const exportPDF = () => {
    const pdf = new jsPDF();
    const margins = { top: 10, left: 10, right: 10 }; // Margins for the PDF
    const pageWidth = pdf.internal.pageSize.getWidth() - margins.left - margins.right;
    const splitText = pdf.splitTextToSize(output, pageWidth); // This will split the text into lines
    pdf.text(splitText, margins.left, margins.top); // Adds the split text to the PDF
    pdf.save('output.pdf'); // Saves the PDF
  };
  

  return (
    <div style={{ margin: '0 auto', width: '50%', padding: '20px' }}>
      <h2>Generer nyt projekt</h2>
      <label>
        Hvor skal ledningen gå imellem?
        <input 
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '8px' }}
        />
      </label>
      <label>
        Hvad skal i bygge?
        <select
          value={question2}
          onChange={(e) => setQuestion2(e.target.value)}
          style={{ display: 'block', width: '103.5%', marginBottom: '10px', padding: '8px' }}
        >
          <option value="">Vælg en type</option>
          <option value="Luftledning">Luftledning</option>
          <option value="Kabel">Kabel</option>
          <option value="Søkabel">Søkabel</option>
        </select>
      </label>
      <label>
        Hvor høj spænding skal det være?
        <input 
          type="text"
          value={question3}
          onChange={(e) => setQuestion3(e.target.value)}
          style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '8px' }}
        />
      </label>
      <button onClick={sendQuestion} style={{ padding: '8px 16px' }}>
        Generer
      </button>
      <div style={{ marginTop: '20px' }}>
        <h3>Baggrund:</h3>
        <textarea
         value={output}
         readOnly
        style={{ width: '100%', height: '100px', padding: '8px' }}
        />
      </div>
      <button onClick={exportPDF} style={{ padding: '8px 16px', marginTop: '10px' }}>
        Export as PDF
      </button>
    </div>
  );
};

export default App;