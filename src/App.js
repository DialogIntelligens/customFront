import React, { useState } from 'react';
import jsPDF from 'jspdf';

const App = () => {
  const [question, setQuestion] = useState('');
  const [question2, setQuestion2] = useState('');
  const [question3, setQuestion3] = useState('');
  const [output, setOutput] = useState('');

  // Function to send the question to the API
  const sendQuestion = async () => {
    try {
      const response = await query({ question: "Hvor skal luftledningerne gå imellem? "+question +". Hvad skal i bygge?"+question2+". Hvor høj spænding skal det være?"+question3 });
      setOutput(response.text);
    } catch (error) {
      console.error('Error fetching response:', error);
      setOutput('Failed to get response from the API.');
    }
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
