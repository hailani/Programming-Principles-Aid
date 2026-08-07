//This file contains the html for the cards used on problems/page.tsx

import Link from "next/link";
import 'bootstrap/dist/css/bootstrap.css';
import "../(styles)/cardStyle.css";

//This contains the values that are pulled for the cards
//These values are from the API in pages/hello.ts
interface propsType {
    problemId: number;
    name: string;
    number:number;
    prompt: string;
    // NEW: We added module and difficulty so the Card can receive them from the list page
    module?: string;     
    difficulty?: string; 
}

function Card(props: propsType) {
    // These values are used to build the dynamic URL string
    const safeModule = props.module || "";
    const safeDifficulty = props.difficulty || "";
    
    // This is the correct variable to use for the link
    const cardLink = `/problems/${props.problemId}?module=${safeModule}&difficulty=${safeDifficulty}`;

    return (
    <div className = "card-columns">
        <div className = "card-deck">
            {/* UPDATED: Changed the href from the static ID to your dynamic cardLink variable */}
            <Link href={cardLink} className="card-link">
                <div className="card">
                    <div className="card-body">
                        <p>
                        {props.number}.  {props.name}
                        </p>
                        <div className = "p1">
                            <p> {props.prompt}</p>
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    </div>
    )
}

export default Card;