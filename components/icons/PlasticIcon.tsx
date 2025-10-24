
import React from 'react';

export const PlasticIcon = ({ className }: { className?: string }) => (
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
        <path d="M8.5 3.5A2.5 2.5 0 0 1 11 1h2a2.5 2.5 0 0 1 2.5 2.5V5h-8v-.5Z"/>
        <path d="M15.5 5H3.2a1 1 0 0 0-.968.745L1 12v6a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V8l-2.032-6.255A1 1 0 0 0 15.8 1H11"/>
        <path d="m5 12 1 6"/>
        <path d="M17 12-1 6"/>
    </svg>
);
