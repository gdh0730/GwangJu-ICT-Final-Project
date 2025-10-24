
import React from 'react';

export const ChlorophyllIcon = ({ className }: { className?: string }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}>
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
        <path d="M12 12c-3 0-5 2.5-5 5"/>
        <path d="M12 7c3 0 5 2.5 5 5"/>
        <path d="M7 12c0-3 2.5-5 5-5"/>
        <path d="M17 12c0 3-2.5 5-5 5"/>
    </svg>
);
