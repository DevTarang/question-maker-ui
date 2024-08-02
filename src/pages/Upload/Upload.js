import react, {useState} from 'react';
import './styles.css'
import axios from 'axios';
import Loader from '../components/Loader';

function Upload() {
    
    const [file, setFile] = useState(null);
    const [pages,setPages] = useState(null);
    const [question, setQuestion] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [score, setScore] = useState(0);
    const [submitted, setSubmitted] = useState(false);

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleUpload = async (event) => {
        event.preventDefault();
        if (file) {
            if (file.type !== 'application/pdf') {
                console.error("The file should be pdf only.")
                return;
            }
            const formData = new FormData();
            formData.append('file', file);

            try {
                const response = await axios.post('http://localhost:3001/upload', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                console.log('File uploaded successfully:', response.data);
                setPages(response.data);
            } catch (error) {
                console.error('Error uploading file:', error);
            }
        } else {
            alert('Please select a file first.');
        }
    };

    const handleGenerate = async (event, idx) => {
        event.preventDefault();
        try {
            setIsLoading(true);
            console.log("checkpoint 1");
            const response = await axios.post('http://localhost:3001/evaluate', { index: idx });
            console.log('Page evaluated successfully:', response.data);
            setQuestion(response.data);
        } catch (error) {
            if (error.response) {
                console.error('Error response:', error.response.data);
            } else if (error.request) {
                console.error('Error request:', error.request);
            } else {
                console.error('Error message:', error.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    function handleScore(event) {
        event.preventDefault(); 
    
        let score = 0; 
    
        question.forEach((ques, idx) => {
            const selectedOption = document.querySelector(`input[name="radio-${idx}"]:checked`);
    
            if (selectedOption) {
                const selectedIndex = Array.from(selectedOption.parentElement.parentElement.children).indexOf(selectedOption.parentElement);
    
                if (selectedIndex === ques.correct) {
                    score += 1; 
                }
            }
        });
        setScore(score);
        setSubmitted(true);
    }
     
    return (
        <>
            {isLoading && <Loader />}
            {!pages ? (
                <div className="Upload-main">
                    <h1>Ai powered Question Generator</h1>
                    <form className='form' onSubmit={handleUpload}>
                        <div className='upper-form'>
                            <input type="file" name="file" id="file" accept="application/pdf" onChange={handleFileChange} />
                        </div>
                        <button className='upload-btn' type="submit">Upload</button>
                    </form>
                </div> ) : ( !question ?
                (<div className='selection-main'>
                    <h1>PageWise View of your pdf</h1>
                    <h3>Select your page to generate questions</h3>
                    {pages.map((items, idx) => (
                        <div key={idx} className='page-main'>
                            <div className='page'>
                                <div className='number'>
                                    Page {idx+1}
                                </div>
                                <div className='content'>
                                    {items.lines}
                                </div>
                            </div>
                            <button 
                                className={`btn ${items.lines.length < 5 ? 'disabled' : ''}`}
                                onClick={(event) => handleGenerate(event, idx)}
                                disabled={items.lines.length < 5}
                            >Generate</button>
                        </div>
                    ))}
                </div>)
                : 
                (<form className='gen-page-main' onSubmit={handleScore}>
                    <h1>Generated Questions</h1>
                    <div className='ques-map-container'>
                        {question.map((ques, idx) => {
                            return ( <div key={idx} className='question-container'>
                                <div className='question'>
                                    {ques.question}
                                </div>
                                <div className='options'>
                                    {ques.options.map((opt,indx) => (
                                        <label key={indx} className="container">{opt.option}
                                            <input type="radio" name={`radio-${idx}`} required />
                                            <span className="checkmark"></span>
                                            {score && (ques.correct == indx) ? <span className='correct'>Correct Answer</span>: null}
                                        </label>
                                    ))}
                                </div>
                            </div>)
                        })}
                    </div>
                    <button className='upload-btn' type='submit'>Check Score</button>
                    {score ? <div className='score'>Score: {score}</div> : null}
                </form>)
            )}
        </>
    );
}
  
export default Upload;