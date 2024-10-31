// components/TypingEffect.js
import React, { useState, useEffect } from 'react';

const TypingEffect = ({ text, speed = 150 }) => {
    const [displayedText, setDisplayedText] = useState('');

    useEffect(() => {
        let index = 0;
        const intervalId = setInterval(() => {
            setDisplayedText((prev) => prev + text.charAt(index));
            index += 1;
            if (index >= text.length) {
                clearInterval(intervalId);
            }
        }, speed);

        return () => clearInterval(intervalId);
    }, [text, speed]);

    return <p className="text-left mt-5 text-gray-900 font-light md:w-9/12 w-11/12 text-base">{displayedText}</p>;
};

export default TypingEffect;
