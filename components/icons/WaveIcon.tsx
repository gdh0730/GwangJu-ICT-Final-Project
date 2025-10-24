
import React from 'react';

export const WaveIcon = ({ className }: { className?: string }) => (
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
        <path d="M2 12c3.5-3.5 3.5-3.5 7 0 3.5 3.5 3.5 3.5 7 0"/>
        <path d="M9 19c3.5-3.5 3.5-3.5 7 0"/>
        <path d="M2 5c3.5 3.5 3.5 3.5 7 0"/>
    </svg>
);
