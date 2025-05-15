"use client"

import { useState } from 'react';
import { RxPaperPlane } from 'react-icons/rx';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import axios from "axios";
import { useAuth } from '@clerk/nextjs';
import { BACKEND_URL } from '@/config/config';

const PromptArea = () => {
    const [prompt, setPrompt] = useState('');
    const [showSignInMessage, setShowSignInMessage] = useState(false);
    const { getToken } = useAuth();

    const handleSubmit = async () => {
        try {
            const token = await getToken();
            if (!token) {
                setShowSignInMessage(true);
                return;
            }
            setShowSignInMessage(false);
            await axios.post(`${BACKEND_URL}/project`, {
                prompt: prompt,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
        } catch (error) {
            console.error("Error submitting prompt:", error);
        }
    };
    
    return (
        <div className="w-full max-w-4xl mx-auto">
            {showSignInMessage && (
                <div className="mb-4 bg-amber-50 border border-amber-200 rounded-md p-3 shadow-sm">
                    <p className="text-amber-800 font-sans font-medium">
                        Please Sign In before making an App
                    </p>
                </div>
            )}
            <div className="relative w-full">
                <Textarea 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Build a Chess Application..."
                    className="w-full font-sans p-4 pr-12 rounded-md border border-gray-300 focus:outline-none focus:ring-2 resize-none min-h-[120px]"
                />
                <Button
                    className="absolute right-2 bottom-2 p-2 rounded-md"
                    onClick={handleSubmit}
                >
                    <RxPaperPlane />
                </Button>
            </div>
        </div>
    );
};

export default PromptArea;