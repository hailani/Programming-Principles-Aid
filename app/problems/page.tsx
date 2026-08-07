"use client"
//problem page uses (components)/Card for loading card
//API call to pages\api/hello.ts for Card info to fill
import Card from './(components)/Card'
import 'bootstrap/dist/css/bootstrap.css';
import "./(styles)/cardStyle.css"
import {useState, useEffect} from "react";
import {CardResponseType} from "@/common/types/CardResponseType";
import axios from "axios";
// Will be used to read the URL search parameters (e.g., ?module=arrays)
import { useSearchParams } from 'next/navigation';


export default function Home() {
    // This block of code essentially pulls the information from the api and gets the information form the cardResponseType interface
    const [cardResponse, setCardResponse] = useState<CardResponseType[]>([]);

    // New: Initialize searchParams to grab the 'module' key from the URL
    const searchParams = useSearchParams();
    const selectedModule = searchParams.get('module'); 
    const selectedDifficulty = searchParams.get('difficulty');
   
    useEffect(() => {
        getCardInfo();
    }, [])

    const getCardInfo = async () => {
                await axios.get<CardResponseType[]>('/api/hello').then((response) => {
            setCardResponse(response.data);
        })
    }

    const formatText = (text: string | null) => { 
        if (!text) return "All";
        
        return text
            .split("-")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    };

// New: Filter logic to compare JSON 'module' field with the URL 'module' parameter
    const filteredCards = cardResponse.filter((data) => {
    // Convert everything to lowercase to prevent "Easy" vs "easy" mismatches
    const targetModule = selectedModule?.toLowerCase();
    const targetDifficulty = selectedDifficulty?.toLowerCase();

    // This is a conditional check to determine if the current card matches the user's selected module & difficulty. The elses are for the case where all modules & difficulties are shown.
    const matchesModule = targetModule ? data.module.toLowerCase() === targetModule : true;
    const matchesDifficulty = targetDifficulty ? data.difficulty?.toLowerCase() === targetDifficulty : true;

    return matchesModule && matchesDifficulty;
});

    // creates a card for each entry in pages/hello.ts this is how we fill our conatiner with cards
    return (
        <main className = "problems-page" style={{ background: "linear-gradient(180deg, #312e81 0%, #7c3aed 100%)", minHeight: "100vh", padding: "40px 48px"}}>
            <div className='home-container'>
                <p className="page-label">Programming Principles Aid</p>
                <h1 className="title"> Choose a Problem</h1>

                <h2 className="h2"> {formatText(selectedModule)} | {formatText(selectedDifficulty)}</h2>
                <p className="problem-instruction"> Select a card below to start practicing.</p>
            </div>
            {cardResponse.length === 0 && (
                <p className="loading-text">Loading Problems...</p>
            )}
            
          <div className="problem-grid">
             {/* Updated: We now map over filteredCards instead of cardResponse to respect the user's selection */}
             {filteredCards !== undefined && filteredCards.map((data, index: number) => {
                 return (
                     <div className="problem-card-wrapper" key={index} style={{ animationDelay: `${index * 0.08}s` }} >
                         {/* Populate cards with the users module and difficulty 
                            selection so it can be used on the problem page to filter the problems shown.
                         */}
                         <div className="problem-badge"> {formatText(data.difficulty)} </div>
                         <Card 
                             problemId={data.problemId} 
                             number={data.number} // added for the cards display to have the right number
                             name={data.name} 
                             prompt={data.prompt}
                             module={data.module}
                             difficulty={data.difficulty}
                         />
                     </div>)
             })}
                {/* Show a message if the selected module is empty */}
                {filteredCards.length === 0 && cardResponse.length > 0 && (
                    <div className="empty-message">
                        <h3 className="text-white">No problems found for {formatText(selectedModule)} | {formatText(selectedDifficulty)}.</h3>
                        <p className="text-white">Check your JSON to ensure "difficulty": "{selectedDifficulty}" exists!</p>
                    </div>
                )}
            </div>
            {/* New button to return to the modules page */}
            <div className="back-button-container"/*style={{ textAlign: 'center', marginTop: '40px' }}*/>
            <a href="/modules" className={"backButton"}>Back To Modules Page</a>
            </div>
        </main>
    )
}