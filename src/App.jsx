import React from 'react';
import Generator from './components/Generator';

export default function App() {
    return (
        <div className="w-full max-w-10xl mx-auto">
            <div className="rounded-2xl p-8" style={{
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                backdropFilter: 'blur(12px) saturate(120%)',
                boxShadow: '0 12px 40px rgba(2,6,23,0.6)'
            }}>
                <Generator />
            </div>
        </div>
    );
}